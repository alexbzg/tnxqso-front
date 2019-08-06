<template>
    <div id="log">
        <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
        <div id="no_net" v-if="stationActive && !statusOnline" class="warning">
          <div id="warning_border">
            <span>There is no Internet connection to the station.</span> The data will be updated after the connection is restored.
          </div>
        </div>
        <div id="call_search">
            Callsign: 
            <input type="text" id="input_call" v-model="searchValue"> 
            <button @click="search()">Search</button>
        </div>

        <table id="search_results" v-if="searchResults && searchResults.length > 0">
          <tr>
            <td id="icon_close">
              <img src="/static/images/icon_close.png" title="Close search results"
                @click="clearSearch()">
            </td>
          </tr>
          <tr>
            <td>
              <log-table :data="searchResults" :log-settings="stationSettings.log" 
              v-if="stationSettings"></log-table>
            </td>
          </tr>
        </table>

        <log-table :data="dataSlice" :log-settings="stationSettings.log" v-if="stationSettings"></log-table>

    </div>
</template>

<script>
import * as moment from 'moment'

import tabMixin from '../station-tab-mixin'
import LogTable from './LogTable'
import storage from '../storage'

const logSearchValueStorageKey = 'logSearchValue'
const current = moment()

export default {
  mixins: [tabMixin],
  name: 'StationStats',
  props: ['stationSettings'],
  data () {
    const fields = []
    for (const field in this.stationSettings.log.columns) {
      if (field !== 'loc' && this.stationSettings.log.columns[field])
        fields.push(field)
    }
    const userField = this.stationSettings.log.userColumns[0]
    const userFieldName = this.stationSettings.userFields[0] || 'User field'
    if (userField)
      fields.push(userFieldName)
    return {
      tabId: 'stats',
      fields: fields,
      filter: {
        band: null,
        mode: null,
        field: 'RDA',
        fieldValue: null
      },
      userField: userField,
      userFieldName: userFieldName
    }
  },
  computed: {
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
          count[field] = this.uniqueVFieldalues(field).size
        }
      }
    },
    userFieldCount () {
      return this.uniqueValues(x => x.userFields[0]).size
    },
    locatorsCount () {
      return this.uniqueValues(x => x.loc).size
    },
    daysCount () {
      return this.uniqueValues(x => x.date).size
    },
    filterFieldValues () {
      const values = this.filter.field === this.userFieldName ?
        this.uniqueValues(x => x.userFields[0]) :
        this.uniqueFieldValues(field)
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
      return this.data.reduce((accumulator, qso) => {
        if (!this.filter.band || qso.band === this.filter.band) {
          if (!this.filter.mode || FULL_MODES[this.filter.mode].indexOf(qso.mode) !== -1) {
            if (!this.filter.fieldValue || 
              ((this.filter.field === this.userFieldName && this.filter.fieldValue === qso.userFields[0]) ||
               (this.filter.field !== this.userFieldName && 
                this.filter.fieldValue === qso[this.filter.field.toLowerCase()]))) {
              accumulator++
            }
          }
        }
        return accumulator
      })
    }
  },
  methods: {
    uniqueFieldValues (field) {
      return this.uniqueValues(x => x[field.toLowerCase()], ', ')
    },
    uniqueValues (lambda, delimiter) {
      if (delimiter) {
        return new Set(this.data.reduce((accumulator, value) => {
          value.split(delimiter).map(x => acummulator.push(x))
          return accumulator
        }))
      }
      return new Set(this.data.map(lambda))
    }
  }
}
</script>

<style scoped>
</style>
