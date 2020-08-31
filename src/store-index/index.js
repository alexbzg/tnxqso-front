import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_UPDATE_USER} from '../store-user'
import {storeServices} from '../store-services'
import {storeActivity, activityInit} from '../store-activity'
import {storeLanguage} from '../store-language'
import {storeActiveStations} from '../store-active-stations'
import talksInit from '../talks-init'

const store = new Vuex.Store({
  modules: {
    user: storeUser,
    services: storeServices,
    activity: storeActivity,
    language: storeLanguage,
    activeStations: storeActiveStations
  }
})

if (store.getters.userToken) {
  store.dispatch(ACTION_UPDATE_USER)
}

talksInit(store)
activityInit(store)

export default store
