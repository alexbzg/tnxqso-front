<template>
    <div id="app">
    <a href="/"><img id="logo" src="/static/images/tnxqso_logo.png" border="0" title="TNXQSO.com"></a>
     <table class="tabs">
        <tr>
            <td id="station_title">
                <h1>{{stationCS}}</h1>
                {{stationTitle}}
                <span class="period" v-if="period !==''">
                    ({{period}})
                </span>
            </td>
        <td rowspan="2" id="status">
            <station-status :stationSettings="stationSettings" @change="onStatusChange"></station-status>
        </td>
    </tr>
    <tr>
        <td>
            <router-link to="/info" tag="div" id="tab_info" class="tab"
                v-if="enable.stationInfo">Info</router-link>
            <router-link to="/log" tag="div" id="tab_log" class="tab"
                v-if="enable.log" :class="{updated_tab: tabsUnread.log}">Log</router-link>
            <router-link to="/map" tag="div" id="tab_map" class="tab"
                v-if="enable.map">Map</router-link>
            <router-link to="/adxcluster" tag="div" id="tab_adxc" class="tab"
                v-if="enable.cluster">Cluster</router-link>
            <router-link to="/stats" tag="div" id="tab_log" class="tab"
                v-if="enable.stats">Stats</router-link>
            <router-link to="/chat" tag="div" id="tab_chat" class="tab"
                v-if="enable.chat"
                :class="{updated_tab: $store.state.services.chat && $store.state.services.chat.new}">
                Chat
            </router-link>
            <router-link to="/gallery" tag="div" id="tab_gallery" class="tab"
                v-if="enable.gallery"
                :class="{updated_tab: $store.state.services.gallery && $store.state.services.gallery.new}">
                Gallery
            </router-link>
            <router-link to="/donate" tag="div" id="tab_donate" class="tab"
                v-if="enable.donate"
                :class="{updated_tab: stationSettings && stationSettings.new.donate && 
                    stationSettings.read.donate}">
                Donate
            </router-link>
            <router-link to="/stations" tag="div" id="tab_stations" class="tab"
                :class="{updated_tab: !$store.state.activeStations.read}">
                Stations
            </router-link>
            <router-link to="/talks" tag="div" id="tab_chat" class="tab"
              :class="{updated_tab: $store.state.services.talks && $store.state.services.talks.new}">
                Talks
            </router-link>
        </td>
    </tr></table>
        <div class="list">
            <donate-block></donate-block>
            <keep-alive include="activeStations">
                <router-view :station-settings="stationSettings" :log-service="logService">
                </router-view>
            </keep-alive>
        </div>
    </div>

</template>

<script>
import {mapState, mapActions} from 'vuex'

import {USER_FIELDS_COUNT} from './constants'
import {ACTION_LOAD_STATION} from './store-station-settings'

import './style.css'
import clusterService from './cluster-service'
import logService from './log-service'
import storage from './storage'
import {formatPeriod} from './utils'
import StationStatus from './components/StationStatus'
import DonateBlock from './components/DonateBlock.vue'

const tabsReadStoragePfx = 'stationTabsRead_'
const tabs = {
  cluster: { service: clusterService, interval: 60000 },
  log: { service: logService, interval: 60000 }
}
const STATION_SETTINGS_RELOAD = 60000

export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  name: 'station',
  components: {StationStatus, DonateBlock},
  data () {
    const tabsUnread = {}
    for (const tab in tabs) {
      tabsUnread[tab] = false
    }
    return {
      tabs: tabs,
      tabsRead: {},
      tabsUnread: tabsUnread,
      activeTab: null,
      enable: {},
      stationCS: null,
      stationTitle: null,
      stationInfo: null,
      statusData: {},
      logService: logService,
      freq: null
    }
  },
  mounted () {
    const vm = this
    this[ACTION_LOAD_STATION]()
      .then( function () {
       const tabsRead = storage.load( tabsReadStoragePfx + vm.stationCS, 'local' )
        if (!tabsRead || typeof tabsRead !== 'object') {
          vm.tabsRead = {}
        } else {
          vm.tabsRead = tabsRead
        }
        for (const id in tabs) {
          vm.tabs[id].updated = null
          vm.tabsUnread[id] = false
          if ( id in vm.tabsRead ) {
            tabs[id].read = tabsRead[id]
          }
        }
      })
      .catch( function () {
        window.location.href = '/'
      })
    for (const id in vm.tabs) {
      const tab = vm.tabs[id]
      tab.service.load()
      tab.intervalId = setInterval( tab.service.load, tab.interval )
      tab.service.onUpdate( function () {
        tab.updated = tab.service.lastModified
        vm.tabUnread( id )
      })
    }
    setInterval(this[ACTION_LOAD_STATION], STATION_SETTINGS_RELOAD)
  },
  beforeDestroy () {
    for (const id in this.tabs) {
      clearInterval( this.tabs[id].intervalId )
    }
    clearInterval( this.userActivityPostIntId )
  },
  watch: {
    tabsUnread: {
      handler() {},
      deep: true
    },
    stationSettings: {
      handler () {
        document.title = this.stationSettings.station.callsign + ' - TNXQSO.com'
        this.stationCS = this.stationSettings.station.callsign
        this.stationTitle = this.stationSettings.station.title
        this.enable = this.stationSettings.enable
        if ( this.stationSettings.enable.stationInfo ) {
          this.stationInfo = this.stationSettings.station.info
        }
      },
      deep: true
    } 
  },
  computed: {
    ...mapState(['stationSettings']),
    period () {
      if (this.stationSettings.station &&
        this.stationSettings.station.activityPeriod && this.stationSettings.station.activityPeriod.length) {
        return formatPeriod(this.stationSettings.station.activityPeriod)
      }
      else {
        return ''
      }
    }
  },
  methods: {
    ...mapActions([ACTION_LOAD_STATION]),
    tabRead ( id ) {
      if ( id ) {
        const tab = this.tabs[id]
        if ( tab.updated && tab.read !== tab.updated ) {
          tab.read = tab.updated
          this.tabsRead[id] = tab.read
          this.tabUnread( id )
          storage.save( tabsReadStoragePfx + this.stationCS, this.tabsRead, 'local' )
        }
      }
      this.activeTab = id
    },
    tabUnread ( id ) {
      const tab = this.tabs[id]
      this.$set( this.tabsUnread, id,
        tab.updated
        ? tab.updated !== tab.read && tab.service.data.length > 0
        : false )
    },
    onStatusChange (statusData) {
      this.$set(this, 'statusData', statusData)
    }
  }
}
</script>

<style>
</style>
