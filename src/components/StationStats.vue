<template>
    <div id="stats_block">
        <table id="stats">
            <tr>
                <td id="stats_total">
                    <table>
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
                    Statistic filter<br/>
                    <select v-model="filter.band">
                        <option :value="null">All bands</option>
                        <option v-for="band in BANDS" :value="band">{{band}} MHz</option>
                    </select>
                    +
                    <select v-model="filter.mode">
                        <option :value="null">All modes</option>
                        <option v-for="mode in MODES" :value="mode">{{mode}}</option>
                    </select>
                    +
                    <select v-model="filter.field" @change="filter.fieldValue = null">
                        <option v-for="field in fields" :value="field">{{field}}</option>
                    </select>
                    +
                    <select v-model="filter.fieldValue">
                        <option :value="null">All</option>
                        <option v-for="value in filterFieldValues" :value="value">{{value}}</option>
                    </select>
                    <div id="filter_result">{{filteredQsoCount}} QSO</div>
                </td>
            </tr>
        </table>

    </div>
</template>
<script>
// import storage from '../storage'
import {MODES, MODES_FULL, orderedBands} from '../ham-radio'

// const logSearchValueStorageKey = 'logSearchValue'

export default {
  name: 'StationStats',
  props: ['stationSettings'],
  data () {
    return {
      tabId: 'stats',
      data: [],
      filter: {
        band: null,
        mode: null,
        field: 'RDA',
        fieldValue: null
      },
      BANDS: orderedBands(),
      MODES: MODES,
      MODES_FULL: MODES_FULL
    }
  },
  mounted () {
    this.service = this.$parent.$data.tabs.log.service
    this.service.onUpdate(this.serviceUpdate)
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
      const data = this.filterQso({band: this.filter.band, mode: this.filter.mode})
      const values = (this.filter.field === this.userFieldName
        ? this.uniqueValues(x => x.userFields[0], data)
        : this.uniqueFieldValues(this.filter.field, data))
      return Array.from(values).sort((a, b) => {
        if (a > b) {
          return 1
        }
        if (a === b) {
          return 0
        }
        if (a < b) {
          return -1
        }
      })
    },
    filteredQsoCount () {
      if (!this.data.length) {
        return 0
      }
      return this.filterQso(this.filter).length
    }
  },
  methods: {
    filterQso (filter) {
      const userFieldName = this.userFieldName
      const modes = filter.mode ? this.MODES_FULL[filter.mode] : null
      return this.data.filter(qso => {
        if (!filter.band || qso.band === filter.band) {
          if (!filter.mode || modes.includes(qso.mode)) {
            if (!filter.fieldValue ||
              ((filter.field === userFieldName && filter.fieldValue === qso.userFields[0]) ||
               (filter.field !== userFieldName && qso[filter.field.toLowerCase()] &&
                qso[filter.field.toLowerCase()].includes(filter.fieldValue)))) {
              return true
            }
          }
        }
        return false
      })
    },
    serviceUpdate () {
      this.data = this.service.data
    },
    uniqueFieldValues (field, data) {
      return this.uniqueValues(x => x[field.toLowerCase()], /[, ]+/, data)
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
            value.split(delimiter).map(x => accumulator.push(x))
          }
          return accumulator
        }, []))
      }
      return new Set(data.map(lambda))
    }
  }
}
</script>

<style scoped>
</style>
