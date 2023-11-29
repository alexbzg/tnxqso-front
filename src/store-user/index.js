import storage from '../storage'
import request from '../request'
import stompClient from '../stomp-client'
import {debugLog} from '../utils'

const STORAGE_KEY_USER_TOKEN = 'userToken'
const STORAGE_KEY_USER_ID = 'userID'

export const MUTATE_USER = 'mutateUser'

export const ACTION_REQUEST = 'actnRqst'
export const ACTION_POST = 'actionPost'
export const ACTION_LOGIN = 'actionLogin'
export const ACTION_LOAD_USER = 'actionLoadUser'
export const ACTION_EDIT_USER = 'actionEditUser'

export const MUTATE_GET_MESSAGES = 'mttPrivateMessages'
const MUTATE_ADD_MESSAGE = 'mttAddMessage'
const MUTATE_DELETE_MESSAGE = 'mttDeleteMessage'
const MUTATE_READ_MESSAGES = 'mttReadMessages'

export const ACTION_DELETE_MESSAGE = 'actnDeleteMessage'
export const ACTION_GET_MESSAGES = 'actnGetMessages'
export const ACTION_READ_MESSAGES = 'actnReadMessages'

const EMPTY_USER = {
  callsign: null,
  token: null,
  settings: {
    enable: {},
    station: {},
    skipConfirmation: {}
  }
}

const LOGIN_ERRORS = {
  'Login is expired': 'Please log in. Пожалуйста, залогиньтесь.',
  'Not logged in': 'Please log in. Пожалуйста, залогиньтесь.',
  'Account is banned': 'Your account is banned. Ваша учетная запись заблокирована.',
  'Token is expired': 'Link is expired. Please repeat your request. Ссылка устарела. Пожалуйста, повторите запрос.'
}

const user = JSON.parse(JSON.stringify(EMPTY_USER))
user.token = storage.load(STORAGE_KEY_USER_TOKEN, 'local')
if (user.token) {
  user.remember = true
} else {
  user.token = storage.load(STORAGE_KEY_USER_TOKEN, 'session')
}
user.id = storage.load(STORAGE_KEY_USER_ID, 'local')
if (!user.id) {
  user.id = crypto.randomUUID()  
  storage.save(STORAGE_KEY_USER_ID, user.id, 'local')
}

function userInit({commit, dispatch, getters}) {
  dispatch(ACTION_GET_MESSAGES)
  const privateMessageCallback = (message) => {
    commit(MUTATE_ADD_MESSAGE, message)
  }
  const chatCallback = (chat) => (message) => {
    debugLog(`${chat} message`)
    debugLog(message)
  }    
  const stompConnectCallback = () => {
    stompClient.subscribe(
        'pm',
        `/exchange/pm/${getters.userCallsign}`,
        privateMessageCallback)
    stompClient.subscribe(
        'talks',
        `/exchange/chat/talks`,
        chatCallback('talks'))

    if (getters.stationCallsign)
        stompClient.subscribe(
        'chat',
        `/exchange/chat/${getters.stationCallsign}`,
        chatCallback('chat'))

  }
  stompClient.init(
    getters.userCallsign,
    getters.userToken,
    stompConnectCallback
  )
}

export const storeUser = {
  state: {
    user: user,
    messages: []
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
    stationAdmin: (state, getters, rootState) => {
      return Boolean(state.user.siteAdmin) || (state.user.emailConfirmed &&
        (rootState.stationSettings?.admin === state.user.callsign ||
        (rootState.stationSettings?.chatAdmins?.includes(state.user.callsign))))
    },
    loggedIn: state => {
      return Boolean(state.user.token)
    },
    emailConfirmed: state => {
      return state.user.email_confirmed
    },
    userStationCallsign: state => {
      return state.user.settings.station.callsign
    },
    user: state => {
      return JSON.parse(JSON.stringify(state.user))
    },
    unreadMessages: state => {
      return state.messages.filter(msg => msg.unread)
    },
    userSettingsInitialized: state => state.user.settings?.initialized,
    bannedBy: state => state.user.banned_by
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
        storage.save(STORAGE_KEY_USER_TOKEN, state.user.token,
            remember ? 'local' : 'session')
      } else {
        stompClient.stop()
      }
    },
    [MUTATE_GET_MESSAGES] (state, payload) {
      state.messages = payload
    },
    [MUTATE_ADD_MESSAGE] (state, payload) {
      state.messages.unshift(payload)
    },
    [MUTATE_DELETE_MESSAGE] (state, payload) {
      if (payload === null) {
        state.messages = []
      } else {
        const idx = state.messages.findIndex(message => message.id === payload)
        state.messages.splice(idx, 1)
      }
    },
    [MUTATE_READ_MESSAGES] (state, payload) {
      for (const message of state.messages) {
        if (payload.includes(message.id)) {
          message.unread = false
        }
      }
    }

  },
  actions: {
    [ACTION_LOGIN] ({commit, dispatch, getters}, payload) {
      return dispatch(ACTION_POST, {path: 'login', data: payload.data})
        .then(response => {
          commit(MUTATE_USER, {user: response.data, remember: payload.remember})
          userInit({commit, dispatch, getters})
        })
    },
    [ACTION_LOAD_USER] ({commit, state, dispatch, getters}) {
      return dispatch(ACTION_POST, {path: 'userData', data: {}})
        .then(response => {
          response.data.token = state.user.token
          commit(MUTATE_USER, {user: response.data})
          userInit({commit, dispatch, getters})
        })
    },
    [ACTION_EDIT_USER] ({commit, state, dispatch, getters}, payload) {
      const data = getters.user
      for (const field in payload) {
        data[field] = JSON.parse(JSON.stringify(payload[field]))
      }
      const tmpToken = Boolean(payload.token)
      return dispatch(ACTION_POST, {path: 'user', data: payload})
        .then(() => {
          commit(MUTATE_USER, tmpToken ? null : {user: data, remember: state.user.remember})
        })
    },
    [ACTION_DELETE_MESSAGE] ({dispatch, commit}, payload) {
      const data = payload === null ? {all: true} : {id: payload}
      return dispatch(ACTION_POST, {
        path: 'privateMessages/delete',
        data: data
      })
        .then(() => {commit(MUTATE_DELETE_MESSAGE, payload)})
    },
    [ACTION_GET_MESSAGES] ({dispatch, commit}) {
      return dispatch(ACTION_POST, {
        path: 'privateMessages/get',
        data: {}
      })
        .then(response => {commit(MUTATE_GET_MESSAGES, response.data)})
    },
    [ACTION_READ_MESSAGES] ({dispatch, commit}, payload) {
      return dispatch(ACTION_POST, {
        path: 'privateMessages/read',
        data: {ids: payload}
      })
        .then(() => {commit(MUTATE_READ_MESSAGES, payload)})
    },
    [ACTION_REQUEST] ({commit, state}, payload) {
      if (!payload.data.token && !payload.skipToken) {
        payload.data.token = state.user.token
      }
      return request.perform(payload.path, payload.data, payload.multipart, payload.method || 'post')
        .catch(error => {
          let msg = ''
          if (error.status === 400 || error.status === 403 || error.status == 401) {
            if (error.message in LOGIN_ERRORS) {
              commit(MUTATE_USER, null)
              msg = LOGIN_ERRORS[error.message]
              return
            }
            msg = error.message
          } else {
            msg = 'Server error. Please try again later.'
          }
          if (!payload.suppressAlert) {
            alert(msg)
          } else 
            error.alert = msg
          throw error
        })
    },
    [ACTION_POST] ({dispatch}, payload) {
        return dispatch(ACTION_REQUEST, payload)
    }
  }
}

