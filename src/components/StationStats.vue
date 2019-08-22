<template>
    <div id="stats_block">
        <table id="stats">
            <tr>
                <td>
                    <table id="stats_total">
                        <tr>
                            <td class="top option"></td><td class="top value">Total</td>
                        </tr>
                        <tr>
                            <td class="option">QSO</td><td class="value">{{qsoCount}}</td>
                        </tr>
                        <tr>
                            <td class="option">Calls</td><td class="value">{{csCount}}</td>
                        </tr>
                        <tr v-for="field in fields">
                            <td class="option">{{field}}</td><td class="value">{{fieldValuesCount[field]}}</td>
                        </tr>
                        <tr>
                            <td class="option">Locators</td><td class="value">{{locatorsCount}}</td>
                        </tr>
                        <tr>
                            <td class="option">Days</td><td class="value">{{daysCount}}</td>
                        </tr>
                    </table>
                </td>
                <td id="stats_filter">
                    Statistic filter
                    <select v-model="filter.field" @change="filter.fieldValue = null; saveFilter()">
                        <option :value="null">All</option>
                        <option v-for="field in fields" :value="field">{{field}}</option>
                    </select>
                    <select v-model="filter.fieldValue" @change="saveFilter()">
                        <option :value="null">All</option>
                        <option v-for="value in filterFieldValues" :value="value">{{value}}</option>
                    </select>
                    <table id="filter_data">
                        <tr>
                            <td id="qso_calls">
                                <select class="data" v-model="type">
                                    <option v-for="_type in types" :value="_type">{{_type}}</option>
                                </select>
                            </td>
                            <td><span>All modes</span></td>
                            <td v-for="mode in MODES">{{mode}}</td>
                        </tr>
                        <tr>                        
                        <tr>                        
                            <td><span>All bands</span></td>
                            <td class="data">{{statsTable.total.total}}</tda>
                            <td v-for="mode in MODES" class="data">{{statsTable.total[mode]}}</td>
                        </tr>
                        <tr :class="{odd: idx % 2 === 0}" v-for="(band, idx) in BANDS">
                            <td>{{band}} <span>MHz</span></td>
                            <td class="data">{{statsTable[band].total}}</tda>
                            <td class="data" v-for="mode in MODES">{{statsTable[band][mode]}}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

    </div>
</template>
<script>
// import storage from '../storage'
import {MODES, MODES_FULL, orderedBands} from '../ham-radio'
import storage from '../storage'

const STATS_FILTER_STORAGE_KEY = 'statsFilter'

// const logSearchValueStorageKey = 'logSearchValue'

export default {
  name: 'StationStats',
  props: ['stationSettings'],
  data () {
    return {
      tabId: 'stats',
      data: [],
      filter: {
        field: 'RDA',
        fieldValue: null
      },
      types: ['QSO', 'Calls'],
      type: 'QSO',
      BANDS: orderedBands(),
      MODES: MODES,
      MODES_FULL: MODES_FULL
    }
  },
  mounted () {
    this.service = this.$parent.$data.tabs.log.service
    this.service.onUpdate(this.serviceUpdate)
    this.loadFilter()
  },
  computed: {
    fields () {
      const fields = []
      if (this.stationSettings) {
        for (const field in this.stationSettings.log.columns) {
          if (field !== 'loc' && this.stationSettings.log.columns[field]) {
            fields.push(field)
          }
        }
        if (this.stationSettings.log.userColumns[0]) {
          fields.push(this.userFieldName)
        }
      }
      return fields
    },
    userFieldName () {
      return (this.stationSettings
        ? this.stationSettings.userFields[0] || 'User field'
        : null)
    },
    qsoCount () {
      return this.data.length
    },
    csCount () {
      return this.uniqueValues(x => x.cs).size
    },
    fieldValuesCount () {
      const count = {}
      for (const field of this.fields) {
        if (field !== this.userFieldName) {
          count[field] = this.uniqueFieldValues(field).size
        }
      }
      return count
    },
    userFieldCount () {
      return (this.fields.includes(this.userFieldName)
        ? this.uniqueValues(x => x.userFields[0]).size
        : 0)
    },
    locatorsCount () {
      return this.uniqueValues(x => x.loc).size
    },
    daysCount () {
      return this.uniqueValues(x => x.date).size
    },
    filterFieldValues () {
      if (!this.filter.field) {
        return []
      }
      const r = (this.filter.field === this.userFieldName
        ? this.uniqueValues(x => x.userFields[0])
        : this.uniqueFieldValues(this.filter.field))
      return [...r].sort()
    },
    statsTable () {
      const r = {}

      function initRow () {
        const row = {}
        for (const mode of MODES) {
          row[mode] = 0
        }
        row.total = 0
        return row
      }

      for (const band of this.BANDS) {
        r[band] = initRow()
      }
      r.total = initRow()

      const qsos = this.filterQso()
      if (qsos.length) {
        if (this.type === 'QSO') {
          for (const qso of qsos) {
            const mode = this.getMode(qso.mode)
            const band = qso.band.replace(',', '.')
            r[band][mode]++
            r[band].total++
            r.total[mode]++
            r.total.total++
          }
          for (const band in r) {
            for (const mode in r[band]) {
              if (!r[band][mode]) {
                r[band][mode] = null
              }
            }
          }
        } else if (this.type === 'Calls') {
          for (const qso of qsos) {
            const mode = this.getMode(qso.mode)
            const band = qso.band.replace(',', '.')
            if (!r[band][mode]) {
              r[band][mode] = new Set()
            }
            if (!r[band].total) {
              r[band].total = new Set()
            }
            if (!r.total[mode]) {
              r.total[mode] = new Set()
            }
            if (!r.total.total) {
              r.total.total = new Set()
            }
            r[band][mode].add(qso.cs)
            r[band].total.add(qso.cs)
            r.total[mode].add(qso.cs)
            r.total.total.add(qso.cs)
          }
          for (const band in r) {
            for (const mode in r[band]) {
              if (r[band][mode]) {
                r[band][mode] = r[band][mode].size
              } else {
                r[band][mode] = null
              }
            }
          }
        }
      }
      return r
    }
  },
  methods: {
    getMode (subMode) {
      for (const mode in MODES_FULL) {
        if (MODES_FULL[mode].includes(subMode)) {
          return mode
        }
      }
    },
    loadFilter () {
      if (this.stationSettings) {
        const filter = storage.load(STATS_FILTER_STORAGE_KEY, 'local')
        if (filter && this.stationSettings.station.callsign in filter) {
          this.filter = filter[this.stationSettings.station.callsign]
        }
      }
    },
    saveFilter () {
      const filter = storage.load(STATS_FILTER_STORAGE_KEY, 'local') || {}
      filter[this.stationSettings.callsign] = this.filter
      storage.save(STATS_FILTER_STORAGE_KEY, filter, 'local' )
    },
    filterQso () {
      const userFieldName = this.userFieldName
      const filter = this.filter
      return this.data.filter(qso => {
        if (!filter.field) {
          return true
        }
        if (filter.fieldValue) {
          if (((filter.field === userFieldName && filter.fieldValue === qso.userFields[0]) ||
            (filter.field !== userFieldName && qso[filter.field.toLowerCase()] &&
            qso[filter.field.toLowerCase()].includes(filter.fieldValue)))) {
            return true
          }
        } else {
          if ((filter.field === userFieldName && qso.userFields[0]) ||
            (filter.field !== userFieldName && qso[filter.field.toLowerCase()])) {
            return true
          }
        }
        return false
      })
    },
    serviceUpdate () {
      this.data = this.service.data
    },
    uniqueFieldValues (field, data) {
      return this.uniqueValues(x => x[field.toLowerCase()], /[, \/]+/, data)
    },
    uniqueValues (lambda, delimiter, data) {
      if (!data) {
        data = this.data
      }
      if (!data.length) {
        return new Set([])
      }
      if (delimiter) {
        return new Set(data.map(lambda).reduce((accumulator, value) => {
          if (value) {
            value.split(delimiter).filter(x => x.length > 1).map(x => accumulator.push(x))
          }
          return accumulator
        }, []))
      }
      return new Set(data.map(lambda))
    }
  },
  watch: {
    stationSettings () {
      this.loadFilter()
    }
  }
}
</script>

<style scoped>
</style>
