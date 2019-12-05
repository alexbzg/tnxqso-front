import storage from '../storage'
import request from '../request'
import {debugLog} from '../utils'

const STORAGE_KEY_CHAT_USER = 'chatUser'
const STORAGE_KEY_CHAT_USER_NAME = 'chatUserName'

const STORAGE_KEY_USER = 'user'

export const MUTATE_SETTINGS = 'mutateSettings'
export const MUTATE_USER = 'mutateUser'
export const MUTATE_CHAT_USER = 'mutateChatUser'
export const MUTATE_CHAT_USER_NAME = 'mutateChatUserName'

export const ACTION_UPDATE_USER = 'actionUpdateUser'
export const ACTION_LOGIN = 'actionLogin'
export const ACTION_POST = 'actionPost'
export const ACTION_SAVE_SETTINGS = 'actionSaveSettings'

const EMPTY_USER = {
  settings: {
    enable: {},
    station: {},
    skipConfimation: {}
  }
}

const user = storage.load(STORAGE_KEY_USER) || JSON.parse(JSON.stringify(EMPTY_USER))

export const storeUser = {
  state: {
    user: user,
    chatUser: storage.load(STORAGE_KEY_CHAT_USER, 'local') || (user ? user.callsign : null),
    chatUserName: storage.load(STORAGE_KEY_CHAT_USER_NAME, 'local')
  },
  getters: {
    userCallsign: state => {
      return state.user ? state.user.callsign : null
    },
    userToken: state => {
      return state.user ? state.user.token : null
    },
    siteAdmin: state => {
      return state.user ? Boolean(state.user.siteAdmin) : false
    },
    loggedIn: state => {
      return state.user ? Boolean(state.user.token) : false
    },
    stationCallsign: state => {
      return state.user ? state.user.settings.station.callsign : null
    },
    user: state => {
      return JSON.parse(JSON.stringify(state.user))
    }
  },
  mutations: {
    [MUTATE_CHAT_USER] (state, payload) {
      if (state.chatUser !== payload) {
        state.chatUser = payload
        storage.save(STORAGE_KEY_CHAT_USER, payload, 'local')
      }
    },
    [MUTATE_CHAT_USER_NAME] (state, payload) {
      if (state.chatUserName !== payload) {
        state.chatUserName = payload
        storage.save(STORAGE_KEY_CHAT_USER_NAME, payload, 'local')
      }
    },
    [MUTATE_USER] (state, payload) {
      const remember = (payload && 'remember' in payload) ? payload.remember : state.user.remember
      const user = (payload && 'user' in payload) ? payload.user : payload
      if (user) {
        state.user = user
        for (const field in EMPTY_USER) {
          if (!user[field]) {
            user[field] = {}
          }
        }
      } else {
        state.user = user || JSON.parse(JSON.stringify(EMPTY_USER))
      }
      state.user.remember = remember
      storage.remove(STORAGE_KEY_USER, 'local')
      storage.remove(STORAGE_KEY_USER, 'session')
      if (payload && payload.user) {
        storage.save(STORAGE_KEY_USER, state.user, remember ? 'local' : 'session')
      }
    }
  },
  actions: {
    [ACTION_LOGIN] ({commit}, payload) {
      return request.post('login', payload.data)
        .then(response => {
          commit(MUTATE_USER, {user: response.data, remember: payload.remember})
        })
    },
    [ACTION_UPDATE_USER] ({commit, state, dispatch}) {
      return dispatch(ACTION_POST, {path: 'userData', data: {}})
        .then(response => {
          response.data.token = state.user.token
          commit(MUTATE_USER, {user: response.data})
        })
    },
    [ACTION_SAVE_SETTINGS] ({commit, state, dispatch, getters}, payload) {
      const data = getters.user
      data.settings = JSON.parse(JSON.stringify(payload))
      return dispatch(ACTION_POST, {path: 'userSettings', data: data})
        .then(() => {
          commit(MUTATE_USER, {user: data, remember: state.user.remeber})
        })
    },
    [ACTION_POST] ({commit, state}, payload) {
      if (!payload.data.token) {
        payload.data.token = state.user.token
      }
      return request.post(payload.path, payload.data)
        .catch(error => {
          let msg = ''
          debugLog(error)
          if (error.status === 400 || error.status === 403 ) {
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
    }
  }
}
