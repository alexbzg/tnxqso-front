<template>
    <div id="log">

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

        <div id="log_block">

          <div id="search_result">
            <img id="icon_close" src="/static/images/icon_close.png" title="Close search results"
                v-if="searchResults" @click="clearSearch()">

            <template v-if="searchResultsRDA">
                <table id="rda_result">
                <tr>
                    <th>RDA</th>
                    <th v-for="band in $options.BANDS" :key="band">{{band}}</th>
                </tr>
                <tr v-for="entry, idx in searchResultsRDA" :key="idx">
                    <td class="rda">{{searchRDA[idx]}}</td>
                    <td v-for="band in $options.BANDS" :key="band">
                        <span v-for="mode in $options.MODES" :key="mode" v-show="entry[band][mode]">
                            {{mode}}
                        </span>
                    </td>
                </tr>
                </table>
            </template>


            <div v-if="searchResults && searchResults.length > 0">
                  <log-table :data="searchResults" :log-settings="stationSettings.log"
                    :qth-field-titles="qthFieldTitles" v-if="stationSettings">
                  </log-table>
            </div>

          </div>


          <log-table :data="data" :log-settings="stationSettings.log"
              :qth-field-titles="qthFieldTitles" v-if="stationSettings">
          </log-table>

        </div>

    </div>
</template>

<script>
import * as moment from 'moment'
import {mapGetters, mapActions} from 'vuex'

import tabMixin from '../station-tab-mixin'
import LogTable from '../components/LogTable'
import storage from '../storage'
import {qthFieldTitles} from '../utils'
import {MODES, orderedBands} from '../ham-radio'
import {ACTION_POST} from '../store-user'

const logSearchValueStorageKey = 'logSearchValue'
const current = moment()

export default {
  BANDS: orderedBands(),
  MODES: MODES,
  mixins: [tabMixin],
  name: 'StationLog',
  props: ['stationSettings'],
  components: { LogTable },
  data () {
    return {
      tabId: 'log',
      searchValue: storage.load( logSearchValueStorageKey, 'local' ),
      searchResults: null,
      searchResultsRDA: null
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    search () {
      this.searchValue = this.searchValue.toUpperCase()
      storage.save(logSearchValueStorageKey, this.searchValue, 'local')
      this[ACTION_POST]({
        path: 'logSearch',
        data: {
          'station': this.stationSettings.admin,
          'callsign': this.searchValue
        },
        skipToken: true
      })
        .then(rsp => {
          this.searchResults = rsp.data
          if (this.searchResults.length === 0) {
            window.alert( 'Nothing was found.' )
          } else {
            if (this.searchRDA) {
              const rda_count = this.searchRDA.length
              if (rda_count > 0) {
                this.searchResultsRDA = []
                for (let i = 0; i < rda_count; i++) {
                  const entry = {}
                  for (const band of this.$options.BANDS) {
                    entry[band] = {}
                    for (const mode of MODES) {
                      entry[band][mode] = false
                    }
                  }
                  this.searchResultsRDA.push(entry)
                }
                for (const qso of this.searchResults) {
                  for (let rda_i = 0; rda_i < rda_count; rda_i++) {
                    if (qso.qth[this.qthFieldRDA].includes(this.searchRDA[rda_i])) {
                      this.searchResultsRDA[rda_i][qso.band][qso.mode] = true
                    }
                  }
                }
              }
            }
          }
        })
    },
    clearSearch () {
      this.searchResults = null
      this.searchResultsRDA = null
    }
  },
  computed: {
    ...mapGetters(['statusData', 'stationCallsign']),
    searchRDA () {
      let r = null
      if (this.qthFieldRDA != -1 && this.statusData && this.statusData.qth) {
        r = this.statusData.qth.fields.values[this.qthFieldRDA].trim().split(' ')
      }
      return r
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
    },
    qthFieldRDA () {
      let r = -1
      if (this.stationSettings.qthCountry === 'RU') {
        r = this.qthFieldTitles.indexOf('RDA')
      }
      return r
    }
  }
}
</script>

<style scoped>
</style>
