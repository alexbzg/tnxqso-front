import Vue from 'vue'

import storage from '../storage'
import request from '../request'

const STORAGE_KEY_SERVICES_READ = 'servicesRead'
const SERVICES_READ = storage.load(STORAGE_KEY_SERVICES_READ, 'local') || {}

export const MUTATE_SERVICE = 'mutateService'
export const MUTATE_SERVICE_DATA = 'mutateServiceData'
export const MUTATE_SERVICE_READ = 'mutateServiceRead'

export const ACTION_UPDATE_SERVICE = 'actionUpdateService'

function setNew (service, val) {
  Vue.set(service, 'new', false)
  if (service.data && service.data.length && service.read) {
    const dataLength = service.data.length
    if (val) {
      for (let c = 0; c < dataLength && service.data[c].ts < service.read; c++) {
        Vue.set(service.data[c], 'new', true)
        if (!service.new) {
          Vue.set(service, 'new', true)
        }
      }
    } else {
      for (let c = 0; c < dataLength && service.data[c].new; c++) {
        if (service.data[c].ts < service.read) {
          Vue.set(service.data[c], 'new', false)
        } else if (!service.new) {
          Vue.set(service, 'new', true)
        }
      }
    }
  }
}

export const storeServices = {
  state: {},
  mutations: {
    [MUTATE_SERVICE] (state, payload) {
      Vue.set(state, payload.name, payload)
      const station = payload.station || 'COMMON'
      if (SERVICES_READ[station] && SERVICES_READ[station][payload.name]) {
        Vue.set(payload, 'read', SERVICES_READ[station][payload.name])
      }
    },
    [MUTATE_SERVICE_DATA] (state, payload) {
      const s = state[payload.service]
      if (s.lastModified !== payload.response.headers['last-modified']) {
        s.lastModified = payload.response.headers['last-modified']
        Vue.set(s, 'data', payload.response.data)
        setNew(s, true)
      }
    },
    [MUTATE_SERVICE_READ] (state, payload) {
      const s = state[payload.service]
      Vue.set(s, 'read', payload.read)
      const station = s.station || 'COMMON'
      if (!SERVICES_READ[station]) {
        SERVICES_READ[station] = {}
      }
      SERVICES_READ[station][s.name] = s.read
      storage.save(STORAGE_KEY_SERVICES_READ, SERVICES_READ, 'local')
      setNew(s, false)
    }
  },
  actions: {
    [ACTION_UPDATE_SERVICE] ({commit, state}, payload) {
      const s = state.services[payload]
      return request.getJSON(s.name, s.station)
        .then(response => {
          commit(MUTATE_SERVICE_DATA, {service: payload, response: response})
        })
    }
  }
}
