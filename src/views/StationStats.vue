<template>
    <div id="stats_block">

        <div id="spinner"
            v-show="pending">
            <img src="/static/images/spinner.gif"/>
        </div>
        <table
            id="stats"
            v-show="!pending">
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
                        <tr v-for="field in fields" :key="field.id">
                            <td class="option">{{field.title}}</td>
                            <td class="value">{{field.count}}</td>
                        </tr>
                        <tr>
                            <td class="option">Days</td><td class="value">{{daysCount}}</td>
                        </tr>
                        <manual-stats></manual-stats>
                    </table>
                </td>
                <td id="stats_filter">
                    Statistic filter
                    <select v-model="filter.field" @change="filter.fieldValue = null; saveFilter()">
                        <option :value="null">All</option>
                        <option v-for="field in fields" :value="field.id" :key="field.id">
                            {{field.title}}
                        </option>
                    </select>
                    <select v-model="filter.fieldValue" @change="saveFilter()">
                        <option :value="null">All</option>
                        <option v-for="value in filterFieldValues" :value="value" :key="value">{{value}}</option>
                    </select>
                    <table id="filter_data">
                        <tr>
                            <td id="qso_calls">
                                <select class="data" v-model="type">
                                    <option v-for="_type in types" :value="_type" :key="_type">{{_type}}</option>
                                </select>
                            </td>
                            <td><span>All modes</span></td>
                            <td v-for="mode in $options.MODES" :key="mode">{{mode}}</td>
                        </tr>
                        <tr>
                        <tr>
                            <td><span>All bands</span></td>
                            <td class="data">{{statsTable.total.total}}</td>
                            <td v-for="mode in $options.MODES" class="data" :key="mode">{{statsTable.total[mode]}}</td>
                        </tr>
                        <tr :class="{odd: idx % 2 === 0}" v-for="(band, idx) in $options.BANDS" :key="band">
                            <td>{{band}} <span>MHz</span></td>
                            <td class="data">{{statsTable[band].total}}</td>
                            <td class="data" v-for="mode in $options.MODES" :key="mode">{{statsTable[band][mode]}}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>


<!--
        <table id="top_qso">
          <tr>
            <th>Тор</th>
            <th>
              <select>
                <option selected>World</option>
                <option>Russia</option>
                <option>Italy</option>
              </select>
            </th>
            <th>QSO</th>
          </tr>
          <tr>
            <td>1</td><td class="call">IK0HBN</td><td class="value">150</td>
          </tr>
          <tr>
            <td>2</td><td class="call">UA9CGL</td><td class="value">80</td>
          </tr>
          <tr>
            <td>3</td><td class="call">RA9AJ</td><td class="value">50</td>
          </tr>
          <tr>
            <td>4</td><td class="call">RM8W</td><td class="value">15</td>
          </tr>
        </table>

-->

    </div>
</template>
<script>
import {mapState, mapActions} from 'vuex'

import {MODES, MODES_FULL, orderedBands} from '../ham-radio'
import storage from '../storage'
import {qthFieldTitles} from '../utils'
import QTH_PARAMS from '../../public/static/js/qthParams.json'
import {ACTION_POST} from '../store-user'

import ManualStats from '../components/ManualStats'

const STATS_FILTER_STORAGE_KEY = 'statsFilter'

export default {
  name: 'StationStats',
  BANDS: orderedBands(),
  MODES: MODES,
  MODES_FULL: MODES_FULL,
  components: {ManualStats},
  data () {
    return {
      tabId: 'stats',
      data: [],
      filter: {
        field: 0,
        fieldValue: null
      },
      types: ['QSO', 'Calls'],
      type: 'QSO',
      pending: false
    }
  },
  mounted () {
    this.update()
  },
  computed: {
    ...mapState(['stationSettings']),
    qthFieldTitles () {
      return qthFieldTitles(this.stationSettings.qthCountry)
    },
    fields () {
      const fields = []
      if (this.stationSettings.log) {
        for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
          if (this.stationSettings.log.columns.qth[co]) {
            fields.push({title: this.qthFieldTitles[co],
              count: this.uniqueFieldValues(co).size,
              id: co
            })
          }
        }
        if (this.stationSettings.log.columns.loc) {
          fields.push({title: 'Locators',
            count: this.uniqueFieldValues('loc').size,
            id: 'loc'
          })
        }
      }
      return fields
    },
    qsoCount () {
      return this.data.length
    },
    csCount () {
      return this.uniqueValues(x => x.cs).size
    },
    locatorsCount () {
      return this.uniqueValues(x => x.loc).size
    },
    daysCount () {
      return this.uniqueValues(x => x.date).size
    },
    filterFieldValues () {
      if (this.filter.field !== 0 && !this.filter.field) {
        return []
      }
      const r = this.uniqueFieldValues(this.filter.field)
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

      for (const band of this.$options.BANDS) {
        r[band] = initRow()
      }
      r.total = initRow()

      const qsos = this.filterQso()
      if (qsos.length) {
        for (const qso of qsos) {
          const mode = this.getMode(qso.mode)
          const band = qso.band.replace(',', '.')
          if (!(band in r) || !(mode in r[band])) {
            continue
          }
          if (this.type === 'QSO') {
            if (r[band] && mode in r[band]) {
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
        }
        if (this.type === 'Calls') {
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
    ...mapActions([ACTION_POST]),
    getMode (subMode) {
      for (const mode in MODES_FULL) {
        if (MODES_FULL[mode].includes(subMode)) {
          return mode
        }
      }
    },
    loadFilter () {
      const filter = storage.load(STATS_FILTER_STORAGE_KEY, 'local')
      if (filter && this.stationSettings.station.callsign in filter) {
        this.filter = filter[this.stationSettings.station.callsign]
      }
    },
    saveFilter () {
      const filter = storage.load(STATS_FILTER_STORAGE_KEY, 'local') || {}
      filter[this.stationSettings.station.callsign] = this.filter
      storage.save(STATS_FILTER_STORAGE_KEY, filter, 'local' )
    },
    filterQso () {
      const filter = this.filter
      return this.data.filter(qso => {
        if (filter.field !== 0 && !filter.field) {
          return true
        }
        if (filter.fieldValue) {
          if ((filter.field === 'loc' && filter.fieldValue === qso.loc) ||
            (filter.field !== 'loc' && qso.qth[filter.field] &&
            qso.qth[filter.field].includes(filter.fieldValue))) {
            return true
          }
        } else {
          if ((filter.field === 'loc' && qso.loc) ||
            (filter.field !== 'loc' && qso.qth[filter.field])) {
            return true
          }
        }
        return false
      })
    },
    serviceUpdate () {
    },
    uniqueFieldValues (field, data) {
      return this.uniqueValues(field === 'loc' ? x => x.loc : x => x.qth[field], /[, ]+/, data)
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
    },
    update () {
      if (this.stationSettings.station) {
        this.pending = true
        this.loadFilter()
        this[ACTION_POST]({
          path: 'logSearch',
          data: {'station': this.stationSettings.admin},
          skipToken: true
        })
          .then(rsp => {
            this.data = rsp.data
          })
          .finally(() => {
            this.pending = false
          })
      }
    }
  },
  watch: {
    stationSettings () {
      this.update()
    }
  }
}
</script>

<style scoped>
</style>
