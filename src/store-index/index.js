import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_UPDATE_USER} from '../store-user'
import {storeServices, MUTATE_SERVICE, ACTION_UPDATE_SERVICE} from '../store-services'

const CHAT_RELOAD_INTERVAL = 5000

const store = new Vuex.Store({
  modules: {
    user: storeUser,
    services: storeServices
  }
})

if (store.getters.userToken) {
  store.dispatch(ACTION_UPDATE_USER)
}

store.commit(MUTATE_SERVICE, {name: 'talks', station: null})
setInterval(store.dispatch(ACTION_UPDATE_SERVICE, 'talks'), CHAT_RELOAD_INTERVAL)

export default store
