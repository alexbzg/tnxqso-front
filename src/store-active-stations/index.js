import Vue from 'vue'
import * as moment from 'moment'

import request from '../request'
import dataServiceFactory from '../data-service-factory'
import {urlCallsign} from '../utils'

export const MUTATE_ACTIVE_STATIONS_READ = 'mttActStationsRead'
const LOAD_STATIONS_ACTION = 'actnLoadStations'
const MUTATE_STATIONS_LIST = 'mttStationsList'
export const MUTATE_STATION_STATUS = 'mttStationStatus'
export const MUTATE_ADD_ACTIVE_STATION = 'mttAddActiveStation'

const STATUS_RELOAD_INT = 1000 * 5
const ONLINE_INT = 120
const FREQ_INT = 300

function sortStations (stations) {

  function cmpStations (a, b) {
    if (a.station.callsign.toLowerCase() < b.station.callsign.toLowerCase()) {
      return -1
    }
    if (a.station.callsign.toLowerCase() > b.station.callsign.toLowerCase()) {
        return 1
    }
    return 0
  }

  return stations.sort(cmpStations)

}

function readState(state) {
  return state.stations.activeIndex.filter(callsign => {
    const entry = state.stations.active[callsign]
    return entry.status && entry.status.online
  })
}

function createActiveStation (state, settings) {
  Vue.set(state.stations.active, settings.station.callsign, {settings: settings, status: {qth: {}}})
}

export const storeActiveStations = {
  state: {
    read: true,
    readState: null,
    stations: {
      active: {},
      activeIndex: [],
      future: [],
      archive: []
    }
  },
  getters: {
    activeStationsRead: state => {
      return state.read
    },
    activeStationsStatus: state => {
      const r = [[], []]
      for (const callsign of state.stations.activeIndex) {
        const entry = state.stations.active[callsign]
        r[entry.status && entry.status.online ? 0 : 1].push(entry.settings)
      }
      return r
    },
    stationStatusService: state => callsign => state.services[callsign]
  },
  mutations: {
    [MUTATE_ACTIVE_STATIONS_READ] (state) {
      state.read = true
      state.readState = readState(state)
    },
    [MUTATE_ADD_ACTIVE_STATION] (state, payload) {
      const callsign = payload.station.callsign
      if (!(callsign in state.stations.active)) {
        createActiveStation(state, payload)
      }
    },
    [MUTATE_STATIONS_LIST] (state, payload) {
      Vue.set(state.stations, 'activeIndex', 
        sortStations(payload.active).map(item => {
          createActiveStation(state, item)
          return item.station.callsign
        })
      )
      Vue.set(state.stations, 'future', sortStations(payload.future))
      Vue.set(state.stations, 'archive', sortStations(payload.archive))
    },
    [MUTATE_STATION_STATUS] (state, payload) {
      const station = state.stations.active[payload.callsign]
      const statusCache = JSON.parse(JSON.stringify(station.status))
      if (payload.data) {
        Vue.set(station, 'status', payload.data)
      }
      if (!station.status || !station.settings) {
        return
      }
      const now = Date.now() / 1000
      const onlineUpdateType = station.settings.status.get
      const online = (onlineUpdateType === 'manual' ? station.status.online
        : (now - station.status.ts) < ONLINE_INT)
      if (station.status.online !== online) {
        Vue.set(station.status, 'online', online)
      }
      let freq = null
      if (station.status.freq && station.status.freq.value && now - station.status.freq.ts < FREQ_INT) {
        freq = station.status.freq.value
      }
      if (station.status.speed && now - station.status.locTs > ONLINE_INT) {
        station.status.speed = null
      }
      if (freq !== station.status.freqDisplay) {
        Vue.set(station.status, 'freqDisplay', freq)
      }
      if (state.readState) {
        if (((!statusCache && station.status.online) || (!statusCache.online && station.status.online)) &&
        !state.readState.includes(payload.callsign)){
          state.read = false
        } else if (!state.read && statusCache && statusCache.online && !station.status.online) {
          const currentReadState = readState(state)
          let newCallsign = false
          for (const callsign of currentReadState) {
            if (!state.readState.includes(callsign)) {
              newCallsign = true
              break
            }
          }
          state.read = !newCallsign
        }
      }
    }
  },
  actions: {
    [LOAD_STATIONS_ACTION] ({commit, getters}) {
        return request.get( '/static/js/publish.json' )
          .then(response => {
            const publishData = response.data
            const current = moment()
            const promises = []
            const stations = {active: [], future: [], archive: []}
            for ( const station in publishData ) {
              if ( ( publishData[station]['user'] && publishData[station]['admin'] ) || getters.siteAdmin ) {
                promises.push(request.getJSON('settings', station)
                  .then(response => {
                    const settings = response.data
                    if (settings.station && settings.station.callsign) {
                      settings.publish = { user: settings.publish, admin: publishData[station]['admin'] }
                      const period = settings.station.activityPeriod.map(item => moment(item, 'DD.MM.YYYY'))
                      if ( period && period.length === 2 && period[0] < current &&
                        period[1].add( 1, 'd' ) > current ) {
                          stations.active.push( settings )
                        } else if ( period && period.length === 2 && moment(period[0]) > current ) {
                          stations.future.push( settings )
                        } else {
                          stations.archive.push( settings )
                        }
                    }
                  })
                  .catch( e => e))
              }
            }
            Promise.all(promises)
              .then(() => {
                commit(MUTATE_STATIONS_LIST, stations)
                for (const stationSettings of stations.active) {
                  createStationStatusService(commit, stationSettings)
                }
              })
        })

    }
  }
}

export function createStationStatusService(commit, stationSettings) {
  const callsign = stationSettings.station.callsign
  const service = dataServiceFactory()
  service.url = `/${urlCallsign(callsign)}/status.json`
  service.processData = () => {
    commit(MUTATE_STATION_STATUS, {callsign: callsign, data: service.data})
  }
  service.load()
  setInterval(service.load, STATUS_RELOAD_INT)
  setInterval(() => {
    commit(MUTATE_STATION_STATUS, {callsign: callsign, data: null})
  }, 1000)
}

export function activeStationsInit(store) {
  return store.dispatch(LOAD_STATIONS_ACTION)
}
