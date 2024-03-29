<template>
    <div id="app">

    <!--<a href="/"><img id="logo" src="/static/images/icon_home.png" border="0" title="TNXQSO.com"></a>-->
    <language-switch v-if="languageSwitchEnabled"></language-switch>
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
            <a href="/" class="tab"><img id="logo" src="/static/images/icon_home.png" border="0" title="TNXQSO.com"></a>
            <router-link to="/info" tag="div" id="tab_info" class="tab"
                v-if="enable.stationInfo">Info</router-link>
            <router-link to="/log" tag="div" id="tab_log" class="tab"
                v-if="enable.log" :class="{updated_tab: tabsUnread.log}">Log</router-link>
            <router-link to="/map" tag="div" id="tab_map" class="tab"
                v-if="enable.map">Map</router-link>
            <router-link to="/cluster" tag="div" id="tab_adxc" class="tab"
                v-if="enable.cluster">Cluster</router-link>
            <router-link to="/stats" tag="div" id="tab_log" class="tab"
                v-if="enable.stats">Stats</router-link>
            <router-link to="/chat" tag="div" id="tab_chat" class="tab"
                v-if="enable.chat"
                :class="{updated_tab: $store.state.services.chat && $store.state.services.chat.new}">Chat</router-link>
            <router-link to="/blog" tag="div" id="tab_blog" class="tab"
                v-if="enable.blog"
                :class="{updated_tab: $store.state.services.blog && $store.state.services.blog.new}">Blog</router-link>
            <router-link to="/donate" tag="div" id="tab_donate" class="tab"
                v-if="enable.donate"
                :class="{updated_tab: stationSettings && stationSettings.new.donate &&
                    stationSettings.read.donate}">Donate</router-link>
            <router-link to="/stations" tag="div" id="tab_stations" class="tab"
                :class="{updated_tab: !$store.state.activeStations.read}">Stations</router-link>
            <router-link to="/talks" tag="div" id="tab_chat" class="tab"
              :class="{updated_tab: $store.state.services.talks && $store.state.services.talks.new}">Talks</router-link>
            <profile-tab/>
            <router-link to="/post" tag="div" id="tab_post" class="tab tab_envelope" v-if="loggedIn">
                <img :src="'/static/images/icon_envelope' + (unreadMessages.length ? '_flash' : '') + '.gif'" />
            </router-link>
        </td>
    </tr></table>
        <div id="wrapper">
          <div id="list">
            <keep-alive include="activeStations">
                <router-view :station-settings="stationSettings" :log-service="logService">
                </router-view>
            </keep-alive>
          </div>
        </div>
    </div>

</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'

import {USER_FIELDS_COUNT} from './constants'
import {ACTION_LOAD_STATION} from './store-station-settings'

import './style.css'
import clusterService from './cluster-service'
import logService from './log-service'
import storage from './storage'
import {formatPeriod} from './utils'
import StationStatus from './components/StationStatus'
import LanguageSwitch from './components/LanguageSwitch'
import ProfileTab from './components/ProfileTab'
import {STATION_TABS} from './constants'
import {stationStatus} from './store-station'


const tabsReadStoragePfx = 'stationTabsRead_'
const tabs = {
  cluster: { service: clusterService, interval: 60000 },
  log: { service: logService, interval: 60000 }
}
const STATION_SETTINGS_RELOAD = 60000
const LOCALIZED_ROUTES = ['Profile', 'Post', 'chat', 'Talks', 'blog']
//const LOCALIZED_ROUTES = []


export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  name: 'station',
  components: {StationStatus, LanguageSwitch, ProfileTab},
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
    //StompClient.connect()
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
        this.stationTitle = this.stationSettings.station.title
        this.enable = this.stationSettings.enable
        if (STATION_TABS.includes(this.$route.name) && !this.enable[this.$route.name])
          this.$router.push('void')
      },
      deep: true
    }
  },
  computed: {
    ...mapState(['stationSettings']),
    ...mapGetters(['loggedIn', 'unreadMessages']),
    languageSwitchEnabled () {
      //return false
      return LOCALIZED_ROUTES.includes(this.$route.name)
    },
    stationCS () {
      return stationStatus()?.callsignDisplay || this.stationSettings.station?.callsign
    },
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
      this.$set(this.tabsUnread, id,
        tab.updated ?
          tab.updated !== tab.read && tab.service.data.length > 0 : false)
    },
    onStatusChange (statusData) {
      this.$set(this, 'statusData', statusData)
    }
  }

}
</script>

<style>
</style>
