import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_LOAD_USER, checkImInit} from '../store-user'
import {storeServices} from '../store-services'
import {storeActivity, activityInit} from '../store-activity'
import {storeLanguage} from '../store-language'
import {storeActiveStations, activeStationsInit} from '../store-active-stations'
import talksInit from '../talks-init'
import stompClient from '../stomp-client'

const store = new Vuex.Store({
  modules: {
    user: storeUser,
    services: storeServices,
    activity: storeActivity,
    language: storeLanguage,
    activeStations: storeActiveStations
  }
})

stompClient.store = store

if (store.getters.userToken) {
  store.dispatch(ACTION_LOAD_USER)
}

talksInit(store)
activityInit(store)
activeStationsInit(store)
checkImInit(store)

export default store
