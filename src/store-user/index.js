import storage from '../storage'
import request from '../request'
import {debugLog} from '../utils'

const STORAGE_KEY_USER_TOKEN = 'userToken'

export const MUTATE_USER = 'mutateUser'
export const MUTATE_INSTANT_MESSAGE = 'mutateInstantMessage'

export const ACTION_POST = 'actionPost'
export const ACTION_LOGIN = 'actionLogin'
export const ACTION_LOAD_USER = 'actionLoadUser'
export const ACTION_EDIT_USER = 'actionEditUser'
const ACTION_CHECK_INSTANT_MESSAGE = 'actionCheckInstantMessage'

const CHECK_IM_INT = 600000

const EMPTY_USER = {
  settings: {
    enable: {},
    station: {},
    skipConfirmation: {}
  }
}

const user = JSON.parse(JSON.stringify(EMPTY_USER))
user.token = storage.load(STORAGE_KEY_USER_TOKEN, 'local')
if (user.token) {
  user.remember = true
} else {
  user.token = storage.load(STORAGE_KEY_USER_TOKEN, 'session')
}

export const storeUser = {
  state: {
    user: user,
    instantMessage: null
  },
  getters: {
    userCallsign: state => {
      return state.user.callsign
    },
    userToken: state => {
      return state.user.token
    },
    userName: state => {
      return state.user.name
    },
    chatCallsign: state => {
      return state.user.chat_callsign
    },
    siteAdmin: state => {
      return Boolean(state.user.siteAdmin)
    },
    loggedIn: state => {
      return Boolean(state.user.token) && state.user.email_confirmed
    },
    stationCallsign: state => {
      return state.user.settings.station.callsign
    },
    user: state => {
      return JSON.parse(JSON.stringify(state.user))
    },
    instantMessage: state => {
      return state.instantMessage
    }
  },
  mutations: {
    [MUTATE_USER] (state, payload) {
      const remember = (payload && 'remember' in payload) ? payload.remember : state.user.remember
      const user = (payload && 'user' in payload) ? payload.user : payload
      if (user) {
        state.user = user
        for (const field in EMPTY_USER) {
          if (!user[field]) {
            user[field] = {}
          }
          for (const subField in EMPTY_USER[field]) {
            if (!user[field][subField]) {
              user[field][subField] = {}
            }
          }
        }
      } else {
        state.user = JSON.parse(JSON.stringify(EMPTY_USER))
      }
      state.user.remember = remember
      storage.remove(STORAGE_KEY_USER_TOKEN, 'local')
      storage.remove(STORAGE_KEY_USER_TOKEN, 'session')
      if (payload && payload.user) {
        storage.save(STORAGE_KEY_USER_TOKEN, state.user.token, remember ? 'local' : 'session')
      }
    },
    [MUTATE_INSTANT_MESSAGE] (state, payload) {
      state.instantMessage = payload
    }
  },
  actions: {
    [ACTION_LOGIN] ({commit}, payload) {
      return request.post('login', payload.data)
        .then(response => {
          commit(MUTATE_USER, {user: response.data, remember: payload.remember})
        })
    },
    [ACTION_LOAD_USER] ({commit, state, dispatch}) {
      return dispatch(ACTION_POST, {path: 'userData', data: {}})
        .then(response => {
          response.data.token = state.user.token
          commit(MUTATE_USER, {user: response.data})
        })
    },
    [ACTION_EDIT_USER] ({commit, state, dispatch, getters}, payload) {
      const data = getters.user
      for (const field in payload) {
        data[field] = JSON.parse(JSON.stringify(payload[field]))
      }
      return dispatch(ACTION_POST, {path: 'userSettings', data: payload})
        .then(() => {
          commit(MUTATE_USER, {user: data, remember: state.user.remember})
        })
    },
    [ACTION_POST] ({commit, state}, payload) {
      if (!payload.data.token && !payload.skipToken) {
        payload.data.token = state.user.token
      }
      return request.post(payload.path, payload.data, payload.multipart)
        .catch(error => {
          let msg = ''
          debugLog(error)
          if (error.status === 400 || error.status === 403 || error.status == 401) {
            if ( error.message === 'Login expired' || error.message === 'Not logged in' ) {
              commit(MUTATE_USER, null)
              return
            }
            msg = error.message
          } else {
            msg = 'Server error. Please try again later.'
          }
          if (!payload.supressAlert) {
            alert(msg)
          }
          throw error
        })
    },
    [ACTION_CHECK_INSTANT_MESSAGE] ({commit, dispatch, state}) {
      if (state.chatUser) {
        return dispatch(ACTION_POST, {
          path: 'instantMessage',
          data: {user: state.chatUser.callsign},
          skipToken: true,
          supressAlert: true
        })
          .then(response => {
            if (response.data) {
              commit(MUTATE_INSTANT_MESSAGE, response.data)
            }
          })
      }
    }
  }
}

export function checkImInit (store) {
  setInterval(() => { store.dispatch(ACTION_CHECK_INSTANT_MESSAGE) }, CHECK_IM_INT)
}
