import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import {storeUser, ACTION_LOAD_USER} from '../store-user'
import {storeServices, MUTATE_SERVICE, ACTION_UPDATE_SERVICE, RELOAD_INT_SRVC} from '../store-services'
import {storeActivity, activityInit} from '../store-activity'
import {storeLanguage} from '../store-language'
import {storeStationSettings, ACTION_LOAD_STATION} from '../store-station-settings'
import talksInit from '../talks-init'
import {storeActiveStations, activeStationsInit, MUTATE_ADD_ACTIVE_STATION} 
  from '../store-active-stations'
import stompClient from '../stomp-client'
import {urlCallsign, urlAdminCallsign} from '../utils'

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

store.dispatch(ACTION_LOAD_STATION)
  .then(() => {
    const stationCs = urlCallsign(store.state.stationSettings.station.callsign)

    store.dispatch(ACTION_LOAD_USER)

    talksInit(store, stationCs)

    //init blog service
    store.commit(MUTATE_SERVICE, 
        {name: 'blog', url: `/aiohttp/blog/${urlAdminCallsign(store.state.stationSettings.admin)}`})
    function updateBlog () {
      store.dispatch(ACTION_UPDATE_SERVICE, 'blog')
    }
    updateBlog()
    setInterval(updateBlog, RELOAD_INT_SRVC)

    activeStationsInit(store)
      .then(() => {
        if (!(stationCs in store.state.activeStations.stations.active)) {
          store.commit(MUTATE_ADD_ACTIVE_STATION, {settings: store.state.stationSettings, forced: true})
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

export function stationStatus () {
  const stationCallsign = store.state.stationSettings.station?.callsign
  if (stationCallsign)
    return stationCallsign && stationCallsign in store.state.activeStations.stations.active ?
        store.state.activeStations.stations.active[stationCallsign].status : {}
  return null
}

export default store
