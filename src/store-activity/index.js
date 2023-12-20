import Vue from 'vue'

import request from '../request'

import {ACTION_POST} from '../store-user'

export const MUTATE_CURRENT_ACTIVITY = 'mttCurrentActivity'
const MUTATE_ACTIVE_USERS = 'mttActiveUsers'
export const MUTATE_USER_ACTIVITY = 'mttUserActivity'

export const ACTION_POST_ACTIVITY = 'actnUpdateService'
export const ACTION_LOAD_ACTIVE_USERS = 'actnLoadActiveUsers'

const UPDATE_INT_ACTIVITY = 60 * 1000 * 1

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
    [MUTATE_USER_ACTIVITY] (state, payload) {
      state.users[payload.callsign] = payload
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
    }
  }
}

export function activityInit (store) {
  setInterval(() => store.dispatch(ACTION_POST_ACTIVITY), UPDATE_INT_ACTIVITY)
  store.dispatch(ACTION_LOAD_ACTIVE_USERS)
}
