import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_LOAD_USER} from '../store-user'
import {storeServices, MUTATE_SERVICE, ACTION_UPDATE_SERVICE, RELOAD_INT_SRVC} from '../store-services'
import {storeActivity, activityInit} from '../store-activity'
import {storeLanguage} from '../store-language'
import {storeStationSettings, ACTION_LOAD_STATION} from '../store-station-settings'
import talksInit from '../talks-init'
import {storeActiveStations, activeStationsInit, createStationStatusService, MUTATE_ADD_ACTIVE_STATION} 
  from '../store-active-stations'
import stompClient from '../stomp-client'
import {urlCallsign} from '../utils'

const RELOAD_INT_STATION_SETTINGS = 60 * 1000

const store = new Vuex.Store({
  modules: {
    user: storeUser,
    services: storeServices,
    activity: storeActivity,
    language: storeLanguage,
    stationSettings: storeStationSettings,
    activeStations: storeActiveStations
  },
  getters: {
    statusData: (state, getters) => {
      let r = {}
      if (getters.stationCallsign && getters.stationCallsign in state.activeStations.stations.active) {
        r = state.activeStations.stations.active[getters.stationCallsign].status
      }
      return r
    }
  }
})

stompClient.store = store

if (store.getters.userToken) {
  store.dispatch(ACTION_LOAD_USER)
}

store.dispatch(ACTION_LOAD_STATION)
  .then(() => {
    const stationCs = store.state.stationSettings.station.callsign

    talksInit(store, stationCs)

    //init blog service
    store.commit(MUTATE_SERVICE, 
        {name: 'blog', url: `/aiohttp/blog/${urlCallsign(store.state.stationSettings.admin)}`})
    function updateBlog () {
      store.dispatch(ACTION_UPDATE_SERVICE, 'blog')
    }
    updateBlog()
    setInterval(updateBlog, RELOAD_INT_SRVC)

    activeStationsInit(store)
      .then(() => {
        if (!(stationCs in store.state.activeStations.stations.active)) {
          store.commit(MUTATE_ADD_ACTIVE_STATION, store.state.stationSettings)
          createStationStatusService(store.commit, store.state.stationSettings)
        }
      })
  })


talksInit(store)
activityInit(store)
setInterval(() => store.dispatch(ACTION_LOAD_STATION), RELOAD_INT_STATION_SETTINGS)

export function isAdmin () {
  if (!store.getters.loggedIn) {
    return false
  }
  return store.getters.siteAdmin || store.getters.isStationAdmin
}

export function stationPath () {
  return `/static/stations/${urlCallsign(store.state.stationSettings.station.callsign)}/`
}

export default store
