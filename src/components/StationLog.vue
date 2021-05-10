<template>
    <div id="log">
        <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
        <div id="no_net" v-if="stationActive && !statusData.online" class="warning">
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
                :qth-field-titles="qthFieldTitles" v-if="stationSettings">
              </log-table>
            </td>
          </tr>
        </table>

        <log-table :data="dataSlice" :log-settings="stationSettings.log" 
            :qth-field-titles="qthFieldTitles" v-if="stationSettings">
        </log-table>

    </div>
</template>

<script>
import * as moment from 'moment'

import tabMixin from '../station-tab-mixin'
import LogTable from './LogTable'
import storage from '../storage'
import {qthFieldTitles} from '../utils'

const logSearchValueStorageKey = 'logSearchValue'
const current = moment()

export default {
  mixins: [tabMixin],
  name: 'StationLog',
  props: ['stationSettings'],
  components: { LogTable },
  data () {
    return {
      tabId: 'log',
      searchValue: storage.load( logSearchValueStorageKey, 'local' ),
      searchResults: null
    }
  },
  methods: {
    search () {
      this.searchValue = this.searchValue.toUpperCase()
      storage.save( logSearchValueStorageKey, this.searchValue, 'local' )
      this.searchResults = this.data.filter( spot => spot.cs === this.searchValue )
      if ( this.searchResults.length === 0 ) {
        window.alert( 'Nothing was found.' )
      }
    },
    clearSearch () {
      this.searchResults = null
    }
  },
  computed: {
    stationCallsign () {
      return this.stationSettings.station ? this.stationSettings.station.callsign : null
    },
    statusData () {
      return this.stationCallsign && this.stationCallsign in this.$store.state.activeStations.stations.active ? 
        this.$store.state.activeStations.stations.active[this.stationCallsign].status : {}
    },
    dataSlice () {
      return Array.isArray( this.data ) ? this.data.slice( 0, 50 ) : []
    },
    stationActive () {
      if ( !this.stationSettings.station ) {
        return false
      }
      const period = this.stationSettings.station.activityPeriod.map(item => moment(item, 'DD.MM.YYYY'))
      return period && period.length === 2 && moment(period[0]) < current &&
        moment(period[1]).add( 1, 'd' ) > current
    },
    qthFieldTitles () {
      return qthFieldTitles(this.stationSettings.qthCountry)
    }
  }
}
</script>

<style scoped>
</style>
