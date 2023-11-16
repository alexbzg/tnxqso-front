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
                <td id="corrs">
                  <table id="top_qso">
                    <tr>
                      <th class="col1">
                        <select
                            v-model="corrStatsSize">
                            <option
                                v-for="val in $options.CORR_STATS_SIZE_OPTIONS"
                                :key="val"
                                :value="val">
                                    Top{{val}}
                            </option>
                        </select>
                      </th>
                      <th id="col2">
                        <select
                          v-model="corrStatsCountrySelected">
                          <option>World</option>
                          <option
                              v-for="country in corrStatsCountries"
                              :key="country">
                              {{country}}
                          </option>
                        </select>
                      </th>
                      <th class="col1">
                        <select
                            v-model="corrStatsMode">
                            <option>QSO</option>
                            <option
                                v-for="mode in $options.MODES"
                                :key="mode">
                                {{mode}}
                            </option>
                        </select>
                      </th>
                    </tr>
                    <tr
                      v-for="entry, idx in corrStatsFiltered"
                      :key="idx"
                      :class="{odd: idx % 2}">
                      <td>{{idx + 1}}</td>
                      <td class="call">{{entry.callsign}}</td>
                      <td class="value">{{entry.QSO[corrStatsMode]}}</td>
                    </tr>
                  </table>
                </td>
            </tr>
        </table>
        

        <template v-if="showVisitors && stationSettings.station && visitors.day">
            <h4 id="visitors_h4">Статистика посещений страниц станции {{stationSettings.station.callsign}}</h4>
            <table id="visitors_table">
                <tr>
                    <th class="period">Посетителей</th>
                    <th 
                        v-for="tab in tabsEnabled"
                        :key="tab"
                        class="tab_visits">
                        {{$options.STATION_TABS_NAMES[tab]}}
                    </th>
                    <th class="tab_visits total">
                        Всего
                    </th>
                </tr>
                <tr v-for="period in $options.PERIODS"
                    :key="period[0]">
                    <td class="period">{{period[1]}}</td>
                    <td 
                        v-for="tab in tabsEnabled"
                        :key="tab"
                        class="tab_visits">
                        {{visitors[period[0]][tab] ? visitors[period[0]][tab] : ''}}
                    </td>
                    <td class="tab_visits total">
                        {{visitors[period[0]].total ? visitors[period[0]].total : ''}}
                    </td>
                </tr>
            </table>
        </template>




    </div>
</template>
<script>
import {mapState, mapActions, mapGetters} from 'vuex'

import {MODES, MODES_FULL, orderedBands} from '../ham-radio'
import storage from '../storage'
import {qthFieldTitles} from '../utils'
import QTH_PARAMS from '../../public/static/js/qthParams.json'
import {ACTION_POST} from '../store-user'
//import request from '../request'
import {STATION_TABS, STATION_TABS_NAMES} from '../constants'
import {urlCallsign} from '../utils'

import ManualStats from '../components/ManualStats'

const STATS_FILTER_STORAGE_KEY = 'statsFilter'
import COUNTRIES from '../countries.json'
import COUNTRY_PFX from '../country_pfx.json'

const CORR_STATS_SIZE_OPTIONS = [10, 20, 100]

export default {
  name: 'StationStats',
  BANDS: orderedBands(),
  MODES: MODES,
  MODES_FULL: MODES_FULL,
  CORR_STATS_SIZE_OPTIONS: CORR_STATS_SIZE_OPTIONS,
  STATION_TABS_NAMES: STATION_TABS_NAMES,
  PERIODS: [['day', 'сегодня'], ['week', 'за неделю'], ['total', 'всего']],
  components: {ManualStats},
  data () {
    return {
      tabId: 'stats',
      data: [],
      filter: {
        field: 0,
        fieldValue: null
      },
      types: ['Calls', 'QSO'],
      type: 'Calls',
      pending: false,
      corrStatsCountrySelected: 'World',
      corrStatsMode: 'QSO',
      corrStatsSize: CORR_STATS_SIZE_OPTIONS[0],
      visitors: {},
      currentTS: Date.now() / 1000 
    }
  },
  mounted () {
    this.update()
  },
  computed: {
    ...mapState(['stationSettings']),
    ...mapGetters(['isStationAdmin', 'siteAdmin']),
    showVisitors () {
      return this.isStationAdmin || this.siteAdmin
    },
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
    corrStats () {
      let r = {}
      for (const qso of this.data) {
        const qso_mode = this.getMode(qso.mode)
        if (qso.cs in r) {
            r[qso.cs].QSO[qso_mode] += 1
            r[qso.cs].QSO.QSO += 1
        } else {
            r[qso.cs] = {QSO: {QSO: 1}, country: null}
            for (const mode of MODES)
                r[qso.cs].QSO[mode] = 0
            r[qso.cs].QSO[qso_mode] = 1
            let pfx = null
            for (let pfx_len = 1; pfx_len < qso.cs.length; pfx_len++) {
              pfx = qso.cs.substr(0, pfx_len)
              if (pfx in COUNTRY_PFX)
                r[qso.cs].country = COUNTRIES[COUNTRY_PFX[pfx]]
              else
                break
            }
        }
      }
      return Object.entries(r).map((entry) => ({callsign: entry[0], ...entry[1]}) )
    },
    corrStatsCountries () {
      let r = {}
      for (const entry of this.corrStats)
        if (entry.country)
            r[entry.country] = null
      r = Object.keys(r)
      r.sort()
      return r
    },
    corrStatsFiltered () {
      const r = this.corrStatsCountrySelected === 'World' ? this.corrStats :
        this.corrStats.filter((item) => item.country === this.corrStatsCountrySelected)
      r.sort((a, b) => b.QSO[this.corrStatsMode] - a.QSO[this.corrStatsMode])
      return r.slice(0, this.corrStatsSize).filter(item => item.QSO[this.corrStatsMode] > 0)
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
    },
    tabsEnabled () {
      return STATION_TABS.filter(tab => this.stationSettings?.enable?.[tab])
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
        if (this.showVisitors)
          this[ACTION_POST]({
            path: 'visitors/stats',
            data: {'station': urlCallsign(this.stationSettings.station.callsign)}
          })
            .then(response => this.visitors = response.data)
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
