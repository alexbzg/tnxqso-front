import Vue from 'vue'

import {ACTION_POST} from '../store-user'

export const MUTATE_GET_MESSAGES = 'mttPrivateMessages'
export const MUTATE_ADD_MESSAGE = 'mttAddMessage'
const MUTATE_DELETE_MESSAGE = 'mttDeleteMessage'
const MUTATE_READ_MESSAGES = 'mttReadMessages'

export const ACTION_DELETE_MESSAGE = 'actnDeleteMessage'
export const ACTION_GET_MESSAGES = 'actnGetMessages'
export const ACTION_READ_MESSAGES = 'actnReadMessages'

export const storeActivity = {
  state: {
    messages: []
  },
  getters: {
    unreadMessages: state => {
      return state.messages.filter(msg => msg.unread)
    }
  },
  mutations: {
    [MUTATE_GET_MESSAGES] (state, payload) {
      state.messages = payload
    },
    [MUTATE_ADD_MESSAGE] (state, payload) {
      state.messages.push(payload)
    },
    [MUTATE_DELETE_MESSAGE] (state, payload) {
      const idx = state.messages.findIndex(message => message.id === payload)
      state.messages.splice(idx, 1)
    },
    [MUTATE_READ_MESSAGES] (state, payload) {
      for (message of state.messages) {
        if (payload.includes(message.id)) {
          Vue.set(message, 'unread', false)
        }
      }
    }
  },
  actions: {
    [ACTION_DELETE_MESSAGE] ({dispatch, commit}, payload) {
      return dispatch(ACTION_POST, {
        path: 'privateMessages/delete',
        data: {id: payload}
      })
        .then(() => {commit(MUTATE_DELETE_MESSAGE, payload)})
    },
    [ACTION_GET_MESSAGES] ({dispatch, commit}) {
      return dispatch(ACTION_POST, {
        path: 'privateMessages/get',
        data: {}
      })
        .then(data => {commit(MUTATE_GET_MESSAGES, data)})
    },
    [ACTION_READ_MESSAGES] ({dispatch, commit}, payload) {
      return dispatch(ACTION_POST, {
        path: 'privateMessages/read',
        data: {ids: payload}
      })
        .then(data => {commit(MUTATE_READ_MESSAGES, data)})
    }
  }
}
