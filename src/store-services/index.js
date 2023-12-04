import Vue from 'vue'

import storage from '../storage'
import request from '../request'

const STORAGE_KEY_SERVICES_READ = 'servicesRead'
const SERVICES_READ = storage.load(STORAGE_KEY_SERVICES_READ, 'local') || {}

export const MUTATE_SERVICE = 'mutateService'
export const MUTATE_SERVICE_DATA = 'mutateServiceData'
export const MUTATE_SERVICE_READ = 'mutateServiceRead'
export const MUTATE_SERVICE_NEW_ITEMS = 'mttServiceNewItems'
export const MUTATE_SERVICE_ADD_ITEM = 'mttServiceAddItem'
export const MUTATE_SERVICE_DELETE_ITEM = 'mttServiceDeleteItem'

export const ACTION_UPDATE_SERVICE = 'actionUpdateService'
export const ACTION_SERVICE_MARK_READ = 'actnServiceMarkRead'

const INT_READ = 10 * 1000
export const RELOAD_INT_SRVC = 1000 * 60

export const updateServiceCallback = ({commit, dispatch, service, item}) => {
  const {add_item, delete_item, reload} = item
  if (add_item) 
    commit(MUTATE_SERVICE_ADD_ITEM, {service, item: add_item})
  if (delete_item) 
    commit(MUTATE_SERVICE_DELETE_ITEM, {service, ...delete_item})
  if (reload)
    dispatch(ACTION_UPDATE_SERVICE, service)
}

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
    [MUTATE_SERVICE_ADD_ITEM] (state, {service, item}) {
      const s = state[service]
      s.data.unshift(item)
      s.lastModified = new Date(item.ts*1000).toUTCString()
      item.new = true
      s.new = true
    },
    [MUTATE_SERVICE_DELETE_ITEM] (state, {service, item_ts, delete_ts}) {
      const s = state[service]
      s.data = s.data.filter(item => item.ts !== item_ts)
      s.lastModified = new Date(delete_ts*1000).toUTCString()
    },
    [MUTATE_SERVICE_DATA] (state, {service, response}) {
      const s = state[service]
      if (s.lastModified !== response.headers['last-modified']) {
        s.lastModified = response.headers['last-modified']
        Vue.set(s, 'data', response.data)
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
    [ACTION_UPDATE_SERVICE] ({commit, state}, service) {
      const s = state[service]
      const config = {headers: {'If-Modified-Since': s.lastModified}}
      return (s.url ? request.get(s.url, config) : request.getJSON(s.name, s.station, config))
        .then(response => commit(MUTATE_SERVICE_DATA, {service, response}))
        .catch((error) => {
            if (error.response.status === 404)
                commit(MUTATE_SERVICE_DATA, {
                    service, 
                    response: {
                        data: [],
                        headers: {}
                    }})
            else
                request.extError(error)

        })
    },
    [ACTION_SERVICE_MARK_READ] ({commit, state}, {ts, service}) {
      const s = state[service]
      if (!s) {
        return
      }
      ts = ts || (s.data && s.data.length ? s.data[0].ts : 0)
      commit(MUTATE_SERVICE_READ, {service, read: ts})
      if (ts) {
        setTimeout(() => {
          commit(MUTATE_SERVICE_NEW_ITEMS,
            {
              service,
              val: false,
              ts
            })
        }, INT_READ)
      }
    }
  }
}
