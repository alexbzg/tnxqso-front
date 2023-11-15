import Vue from 'vue'

import request from '../request'

import {ACTION_POST} from '../store-user'

export const MUTATE_CURRENT_ACTIVITY = 'mttCurrentActivity'
const MUTATE_ACTIVE_USERS = 'mttActiveUsers'
export const MUTATE_USERS_CONSUMER = 'mttUsersConsumer'

export const ACTION_POST_ACTIVITY = 'actnUpdateService'
export const ACTION_LOAD_ACTIVE_USERS = 'actnLoadActiveUsers'
export const ACTION_ADD_USERS_CONSUMER = 'actnAddUsersConsumer'

const UPDATE_INT_ACTIVITY = 60 * 1000 * 1
const RELOAD_INT_ACTIVE_USERS = 2000

export const storeActivity = {
  state: {
    current: {
      chat: false,
      station: null
    },
    users: {},
    usersReloadTask: null,
    usersConsumers: {}
  },
  mutations: {
    [MUTATE_CURRENT_ACTIVITY] (state, payload) {
      Vue.set(state, 'current', payload)
    },
    [MUTATE_ACTIVE_USERS] (state, payload) {
      Vue.set(state, 'users', payload)
    },
    [MUTATE_USERS_CONSUMER] (state, payload) {
      if (payload.value) {
        Vue.set(state.usersConsumers, payload.id, true)
        if ('reloadTask' in payload) {
          Vue.set(state, 'usersReloadTask', payload.reloadTask)
        }
      } else {
        if (payload.id in state.usersConsumers) {
          Vue.delete(state.usersConsumers, payload.id)
        }
        if (!Object.keys(state.usersConsumers).length) {
          clearInterval(state.usersReloadTask)
          Vue.set(state, 'usersReloadTask', null)
        }
      }
    }
  },
  actions: {
    [ACTION_POST_ACTIVITY] ({state, rootState, dispatch}, payload) {
      if (rootState.user.user.chat_callsign && rootState.user.user.chat_callsign.length > 2) {
        return dispatch(ACTION_POST, {
          path: 'activeUsers',
          data: {
            station: state.current.station,
            chat: state.current.chat,
            callsign: rootState.user.user.callsign,
            name: rootState.user.user.name,
            chat_callsign: rootState.user.user.chat_callsign,
            pm_enabled: rootState.user.user.pm_enabled,
            typing: Boolean(payload)
            }
        })
      }
    },
    [ACTION_LOAD_ACTIVE_USERS] ({commit}) {
      return request.getJSON('activeUsers')
        .then(response => {
          if (response.data && typeof response.data === 'object') {
            commit(MUTATE_ACTIVE_USERS, response.data)
          }
        })
        .catch(() => {})
    },
    [ACTION_ADD_USERS_CONSUMER] ({commit, state, dispatch}, payload) {
      const mttPayload = {id: payload, value: true}
      if (!state.usersReloadTask) {
        dispatch(ACTION_LOAD_ACTIVE_USERS)
        mttPayload.reloadTask =
          setInterval(() => { dispatch(ACTION_LOAD_ACTIVE_USERS) }, RELOAD_INT_ACTIVE_USERS)
      }
      commit(MUTATE_USERS_CONSUMER, mttPayload)
    }
  }
}

export function activityInit (store) {
  setInterval(() => store.dispatch(ACTION_POST_ACTIVITY), UPDATE_INT_ACTIVITY)
}
