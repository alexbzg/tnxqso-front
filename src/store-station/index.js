import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_UPDATE_USER} from '../store-user'
import {storeServices} from '../store-services'
import {storeActivity, activityInit} from '../store-activity'
import {storeStationSettings, ACTION_LOAD_STATION} from '../store-station-settings'
import talksInit from '../talks-init'

const store = new Vuex.Store({
  modules: {
    user: storeUser,
    services: storeServices,
    activity: storeActivity,
    stationSettings: storeStationSettings
  }
})

if (store.getters.userToken) {
  store.dispatch(ACTION_UPDATE_USER)
}
store.dispatch(ACTION_LOAD_STATION)
  .then(() => {
    const stationCs = store.state.stationSettings.station.callsign
    talksInit(store, stationCs)
  })
talksInit(store)
activityInit(store)

export default store
