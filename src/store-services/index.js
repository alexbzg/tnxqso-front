import Vue from 'vue'

import storage from '../storage'
import request from '../request'

const STORAGE_KEY_SERVICES_READ = 'servicesRead'
const SERVICES_READ = storage.load(STORAGE_KEY_SERVICES_READ, 'local') || {}

export const MUTATE_SERVICE = 'mutateService'
export const MUTATE_SERVICE_DATA = 'mutateServiceData'
export const MUTATE_SERVICE_READ = 'mutateServiceRead'
export const MUTATE_SERVICE_NEW_ITEMS = 'mttServiceNewItems'

export const ACTION_UPDATE_SERVICE = 'actionUpdateService'
export const ACTION_SERVICE_MARK_READ = 'actnServiceMarkRead'

const INT_READ = 10 * 1000
export const RELOAD_INT_SRVC = 1000 * 60

function setNew (service, val, ts) {
  Vue.set(service, 'new', false)
  ts = ts || service.read
  if (service.data && service.data.length && service.read) {
    const dataLength = service.data.length
    if (val) {
      Vue.set(service, 'new', service.read < service.data[0].ts)
      for (let c = 0; c < dataLength && service.data[c].ts > ts; c++) {
        Vue.set(service.data[c], 'new', true)
      }
    } else {
      for (let c = 0; c < dataLength && service.data[c].new; c++) {
        if (service.data[c].ts <= ts) {
          Vue.set(service.data[c], 'new', false)
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
      Vue.set(payload, 'data', [])
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
      if (!s) {
        return
      }
      Vue.set(s, 'read', payload.read)
      Vue.set(s, 'new',
        s.data && s.data.length ? s.data[0].ts > payload.read : false)
      const station = s.station || 'COMMON'
      if (!SERVICES_READ[station]) {
        SERVICES_READ[station] = {}
      }
      SERVICES_READ[station][s.name] = s.read
      storage.save(STORAGE_KEY_SERVICES_READ, SERVICES_READ, 'local')
    },
    [MUTATE_SERVICE_NEW_ITEMS] (state, payload) {
      setNew(state[payload.service], payload.val, payload.ts)
    }
  },
  actions: {
    [ACTION_UPDATE_SERVICE] ({commit, state}, payload) {
      const s = state[payload]
      const config = {headers: {'If-Modified-Since': s.lastModified}}
      return (s.url ? request.get(s.url, config) : request.getJSON(s.name, s.station, config))
        .then(response => {
          if (response && response.headers['last-modified'] !== s.lastModified) {
            commit(MUTATE_SERVICE_DATA, {service: payload, response })
          }
        })
        .catch((error) => {
            if (error.status === 404) {
                commit(MUTATE_SERVICE_DATA, {
                    service: payload, 
                    response: {
                        data: [],
                        headers: {}
                    }})
            }
        })
    },
    [ACTION_SERVICE_MARK_READ] ({commit, state}, payload) {
      const s = state[payload.service]
      if (!s) {
        return
      }
      const ts = payload.ts || (s.data && s.data.length ? s.data[0].ts : 0)
      commit(MUTATE_SERVICE_READ, {service: payload.service, read: ts})
      if (ts) {
        setTimeout(() => {
          commit(MUTATE_SERVICE_NEW_ITEMS,
            {
              service: payload.service,
              val: false,
              ts: ts
            })
        }, INT_READ)
      }
    }
  }
}
