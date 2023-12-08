import Vue from 'vue'

import storage from '../storage'
import request from '../request'
import {hash, urlCallsign} from '../utils'

const STORAGE_KEY_STATIONS_READ = 'stationsRead'
const STATIONS_READ = storage.load(STORAGE_KEY_STATIONS_READ, 'local') || {}

const MUTATE_STATION = 'mttStation'
export const MUTATE_STATION_READ = 'mttStationRead'
export const ACTION_LOAD_STATION = 'actnLoadStation'

export const storeStationSettings = {
  state: {
    station: null,
    enable: null,
    log: null,
    status: null,
    read: {'donate': null},
    new: {'donate':null}
  },
  getters: {
    stationCallsign: state => {
      return state.station?.callsign
    },
    stationCallsignUrl: state => {
      return urlCallsign(state.station?.callsign)
    },
    isStationAdmin: (state, rootGetters) => {
      return state.admin && state.admin  === rootGetters.userCallsign
    },
    chatAccess: (state) => {
      return state.chatAccess
    },
    isChatAdmin: (state) => (callsign) => {
      return callsign === state.admin || state.chatAdmins.includes(callsign)
    }, 
    stationAdminCallsign: (state) => state.admin,
    enabledTabs: state => state.enable
  },
  mutations: {
    [MUTATE_STATION] (state, payload) {
      const init = !state.station
      for (const key in payload) {
        Vue.set(state, key, payload[key])
      }
      if (init) {
        if (!(state.station.callsign in STATIONS_READ)) {
          STATIONS_READ[state.station.callsign] = {'donate': null}
        }
        state.read = STATIONS_READ[state.station.callsign]
      }
      for (const key in state.read) {
        const newHash = state[key] ? hash(JSON.stringify(state[key])) : null
        if (newHash !== state.read[key]) {
          Vue.set(state.new, key, newHash)
        }
      }      
    },
    [MUTATE_STATION_READ] (state, payload) {
      state.read[payload] = state.new[payload]
      storage.save(STORAGE_KEY_STATIONS_READ, STATIONS_READ, 'local')
      Vue.set(state.new, payload, null)
    }
  },
  actions: {
    [ACTION_LOAD_STATION] ({commit}) {
      return request.get('settings.json')
        .then(response => {
          commit(MUTATE_STATION, response.data)
        })
    }
  }
}
