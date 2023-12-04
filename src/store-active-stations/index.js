import Vue from 'vue'
import * as moment from 'moment'

import request from '../request'

export const MUTATE_ACTIVE_STATIONS_READ = 'mttActStationsRead'
const LOAD_STATIONS_ACTION = 'actnLoadStations'
const MUTATE_STATIONS_LIST = 'mttStationsList'
const MUTATE_REMOVE_ACTIVE_STATION = 'mttRemoveActiveStation'
const MUTATE_STATIONS_LAST_MODIFIED = 'mttStationsLastModified'
const MUTATE_FORCED_LAST_MODIFIED = 'mttForcedLastModified'
const LOAD_STATUS_ACTION = 'actnLoadStationsStatus'
const CREATE_ACTIVE_STATION_ACTION = 'actCreateActiveStation'
export const MUTATE_STATION_STATUS = 'mttStationStatus'
export const MUTATE_ADD_ACTIVE_STATION = 'mttAddActiveStation'
const MUTATE_PENDING = 'mttPending'

const STATUS_RELOAD_INT = 1000 * 5
const ONLINE_INT = 120
const FREQ_INT = 300

const sortStations = (stations) => stations.sort( (a, b) => a.callsign < b.callsign ? -1 : 1 )

const readState = (state) => state.stations.activeIndex.filter( callsign => 
    state.stations.active[callsign].status?.online )

const createActiveStation = (state, settings) => 
  Vue.set(state.stations.active, settings.station.callsign, 
      {settings: settings, status: {qth: {fields: {values: []}}}})


export const storeActiveStations = {
  state: {
    read: true,
    readState: null,
    stations: {
      active: {},
      activeIndex: [],
      future: [],
      archive: [],
      forcedActive: {},
      lastModified: null,
    },
    pending: {}
  },
  getters: {
    activeStationsRead: state => {
      return state.read
    },
    activeStationsStatus: state => {
      const r = [[], []]
      for (const callsign of state.stations.activeIndex) {
        const entry = state.stations.active[callsign]
        r[entry.status?.online ? 0 : 1].push(entry.settings)
      }
      return r
    }
  },
  mutations: {
    [MUTATE_PENDING] (state, pending) {
      state.pending = {...state.pending, ...pending}
    },
    [MUTATE_ACTIVE_STATIONS_READ] (state) {
      state.read = true
      state.readState = readState(state)
    },
    [MUTATE_ADD_ACTIVE_STATION] (state, {settings, forced}) {
      createActiveStation(state, settings)    
      if (forced) {
        if (!(settings.station.callsign in state.stations.forcedActive))
          state.stations.forcedActive[settings.station.callsign] =
            {lastUpdated: null}
      } else {
        const indexLen = state.stations.activeIndex.length
        for (let i = 0; i < indexLen && state.stations.activeIndex[i] < settings.station.callsign; 
          i++)
        state.stations.activeIndex.splice(i, 0, settings.station.callsign)
      }
    },
    [MUTATE_REMOVE_ACTIVE_STATION] (state, callsign) {
      if (state.stations.activeIndex.includes(callsign)) {
        const idx = state.stations.activeIndex.findIndex(item => item === callsign)
        state.stations.activeIndex.splice(idx, 0)
      }
    },
    [MUTATE_STATIONS_LIST] (state, {future, active, archive}) {
      state.stations.future = sortStations(future)
      state.stations.archive = sortStations(archive)
      state.stations.activeIndex = sortStations(active).map(item => {
        createActiveStation(state, item)
        return item.station.callsign
      }) 
    },
    [MUTATE_STATIONS_LAST_MODIFIED] (state, lastModified) {
      state.stations.lastModified = lastModified
    },
    [MUTATE_FORCED_LAST_MODIFIED] (state, {callsign, lastModified}) {
      state.stations.forcedActive[callsign] = lastModified
    },
    [MUTATE_STATION_STATUS] (state, {callsign, status}) {
      const station = state.stations.active[callsign]
      const statusCache = JSON.parse(JSON.stringify(station.status))
      if (status) 
        station.status = status
      if (!station.status || !station.settings) {
        return
      }
      const now = Date.now() / 1000
      const onlineUpdateType = station.settings.status.get
      const online = (onlineUpdateType === 'manual' ? station.status.online
        : (now - station.status.ts) < ONLINE_INT)
      station.status.online = online
      let freq = null
      if (station.status.freq && station.status.freq.value && now - station.status.freq.ts < FREQ_INT) {
        freq = station.status.freq.value
      }
      if (station.status.speed && now - station.status.locTs > ONLINE_INT) {
        station.status.speed = null
      }
      station.status.freqDisplay = freq
      if (state.readState) {
        if (((!statusCache && station.status.online) || (!statusCache.online && station.status.online)) &&
        !state.readState.includes(callsign)){
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
    async [LOAD_STATIONS_ACTION] ({commit, dispatch, getters}) {
      const {data: publishData} = await request.getJSON('publish')
      const current = moment()
      const promises = []
      const stations = {active: [], future: [], archive: []}
      for (const station in publishData) {
        if ((publishData[station]['user'] && publishData[station]['admin']) || getters.siteAdmin) {
          promises.push(
            request.getJSON('settings', station)
              .then(({data: settings}) => {
                if (settings.station && settings.station.callsign) {
                  settings.publish = { user: settings.publish, admin: publishData[station]['admin'] }
                  const period = settings.station.activityPeriod.map(item => moment(item, 'DD.MM.YYYY'))
                  if (period?.length === 2 && period[0] < current && period[1].add(1, 'd') > current)
                    stations.active.push(settings)  
                  else if (period?.length === 2 && moment(period[0]) > current)
                    stations.future.push(settings)
                  else 
                    stations.archive.push(settings)
                 }
               })
               .catch(request.extError))
        }
      }
      Promise.all(promises)
        .then(() => {
           commit(MUTATE_STATIONS_LIST, stations)
           dispatch(LOAD_STATUS_ACTION)
           setInterval(() => dispatch(LOAD_STATUS_ACTION), STATUS_RELOAD_INT)
        })
    },
    async [CREATE_ACTIVE_STATION_ACTION] ({commit},  {callsign, forced}) {
      try {
        const {data: settings} = await request.getJSON('settings', callsign)
        commit(MUTATE_ADD_ACTIVE_STATION, {settings, forced})
        return true
      } catch (error) {
        request.extError(error)
        return false
      }
    },
    async [LOAD_STATUS_ACTION] ({commit, dispatch, state}) {
      (async () => {
        if (state.pending.active)
          return
        commit(MUTATE_PENDING, {active: true})
        try {
          const { data, headers } = await request.getJSON('activeStations', null,
            {headers: {'If-Modified-Since': state.stations.lastModified}})
          commit(MUTATE_STATIONS_LAST_MODIFIED, headers['last-modified'])
          const updated = {}
          for (const {callsign, status} of data) {
            updated[callsign] = true
            if ((callsign in state.stations.active) ||
              (await dispatch(CREATE_ACTIVE_STATION_ACTION, {callsign, forced: false})))
              commit(MUTATE_STATION_STATUS, {callsign, status})
          }
          for (const prevCallsign of state.stations.activeIndex)
            if (!(prevCallsign in updated))
              commit(MUTATE_REMOVE_ACTIVE_STATION, prevCallsign)
        } catch (error) {
          request.extError(error)
        } finally {
          commit(MUTATE_PENDING, {active: false})
        }
      })();
      (async () => {
        for (const callsign in state.stations.forcedActive) {
          if (state.stations.activeIndex.includes(callsign) 
            || state.pending[callsign])
            continue
          commit(MUTATE_PENDING, {[callsign]: true})
          try {
            const {data: status, headers} = await request.getJSON('status', callsign,
              {headers: {'If-Modified-Since': 
                 state.stations.forcedActive[callsign].lastModified}})
            commit(MUTATE_STATION_STATUS, {callsign, status})
            commit(MUTATE_FORCED_LAST_MODIFIED,
              {callsign, lastModified: headers['last-modified']})
          } catch (error) {
            request.extError(error)
          } finally {
            commit(MUTATE_PENDING, {[callsign]: false})
          }
        }
      })()
    }
  }
}

export async function activeStationsInit(store) {
  await store.dispatch(LOAD_STATIONS_ACTION)
}
