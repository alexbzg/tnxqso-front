import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_UPDATE_USER} from '../store-user'
import {storeServices, MUTATE_SERVICE, ACTION_UPDATE_SERVICE, RELOAD_INT_SRVC} from '../store-services'
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
    store.commit(MUTATE_SERVICE, {name: 'gallery', station: stationCs})
    function updateGallery () {
      store.dispatch(ACTION_UPDATE_SERVICE, 'gallery')
    }
    updateGallery()
    setInterval(updateGallery, RELOAD_INT_SRVC)
  })
talksInit(store)
activityInit(store)

export default store
