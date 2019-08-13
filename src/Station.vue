<template>
    <div id="app">
    <a href="/"><img id="logo" src="/static/images/tnxqso_logo.png" border="0" title="TNXQSO.com"></a>
     <table class="tabs">
        <tr>
            <td id="station_title">
                <h1>{{stationCS}}</h1>
                {{stationTitle}} 
                <span class="period" v-if="stationSettings && stationSettings.station.activityPeriod && 
                    stationSettings.station.activityPeriod.length == 2">
                    ({{formatDate(stationSettings.station.activityPeriod[0])}} &mdash; 
                    {{formatDate(stationSettings.station.activityPeriod[1])}})
                </span>
            </td>
        <td rowspan="2" id="status">
            <div id="status_block_top" 
                :class="{status_online: statusData.online, status_offline: !statusData.online}">
                <b>{{statusData.online ? 'ONLINE': 'OFFLINE'}}</b>
            </div>
            <table id="status_block_info" v-if="statusData.online"><tr>
                <td id="current_loc">
                    <span>{{statusData.date}}  {{statusData.year}} {{statusData.time}}</span><br/>
                    <template v-if="stationSettings && stationSettings.status.fields.RDA && statusData.rda">
                        RDA&nbsp;<b>{{statusData.rda}}</b><br/>
                    </template>
                    <template v-if="stationSettings && stationSettings.status.fields.RAFA && statusData.rafa">
                        RAFA&nbsp;<b>{{statusData.rafa}}</b><br/>
                    </template>
                    <template v-if="stationSettings && stationSettings.status.fields.WFF && statusData.wff">
                        WFF&nbsp;<b>{{statusData.wff}}</b><br/>
                    </template>
                    <template v-if="stationSettings && stationSettings.status.fields.loc && statusData.loc">
                        <b>{{statusData.loc}}</b><br/>
                    </template>
                    <template v-for="n in $options.USER_FIELDS_COUNT" 
                        v-if="stationSettings && stationSettings.status.userFields[n-1] && 
                            statusData.userFields[n-1]">
                        {{stationSettings.userFields[n-1]}}&nbsp;<b>{{statusData.userFields[n-1]}}</b><br/>
                    </template>
                </td>
            </tr></table>
        </td>
    </tr>
    <tr>
        <td>
            <router-link to="/info" tag="div" id="tab_info" class="tab" 
                v-if="enable.stationInfo">Info</router-link>
            <!--router-link to="/news" tag="div" id="tab_news" class="tab" 
                v-if="enable.news" :class="{updated_tab: tabsUnread.news}">
                News</router-link-->
            <router-link to="/log" tag="div" id="tab_log" class="tab" 
                v-if="enable.log" :class="{updated_tab: tabsUnread.log}">Online log</router-link>
            <router-link to="/map" tag="div" id="tab_map" class="tab" 
                v-if="enable.map">Map</router-link>
            <router-link to="/adxcluster" tag="div" id="tab_adxc" class="tab" 
                v-if="enable.cluster">ADXcluster</router-link>
            <router-link to="/chat" tag="div" id="tab_chat" class="tab" 
                v-if="enable.chat" :class="{updated_tab: tabsUnread.chat }">
                Chat
            </router-link>
            <div id="tab_instagram" class="tab" 
                v-if="enable.instagram && stationSettings && stationSettings.instagramID">
                <a :href="'https://www.instagram.com/' + stationSettings.instagramID" 
                    target="_blank" rel="noopener">Instagram</a>
            </div>
            <router-link to="/stats" tag="div" id="tab_log" class="tab" 
                v-if="enable.log">Stats</router-link>
            <router-link to="/donate" tag="div" id="tab_donate" class="tab" 
                v-if="enable.donate">Support us</router-link>
        </td>
    </tr></table>
        <div class="list">
            <router-view :station-settings="stationSettings" :user="user" :chatUser="chatUser"
            :status-service="statusService" :status-online="statusData.online" 
            :log-service="logService"></router-view>
        </div>
    </div>

</template>

<script>
import {USER_FIELDS_COUNT} from './constants'

import * as moment from 'moment'

import './style.css'
import stationSettings from './station-settings-service'
import clusterService from './cluster-service'
import chatService from './chat-service'
import statusService from './status-service'
import logService from './log-service'
import user from './user'
import storage from './storage'

const chatUserStorageKey = 'chatUser'
const tabsReadStoragePfx = 'stationTabsRead_'
const tabs = {
  cluster: { service: clusterService, interval: 60000 },
  log: { service: logService, interval: 60000 },
  chat: { service: chatService, interval: 5000 }
}
const onlineInt = { qsoclient: 150, gpslogger: 300 }
const userActivityPostInt = 60 * 1000 * 1
const statusUpdateInt = 60 * 1000 * 1

export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  name: 'station',
  data () {
    const chatUser = storage.load( chatUserStorageKey, 'local' ) || user.callsign
    const tabsUnread = {}
    for (const tab in tabs) {
      tabsUnread[tab] = false
    }
    return {
      tabs: tabs,
      tabsRead: {},
      tabsUnread: tabsUnread,
      chatUser: chatUser ? chatUser.toUpperCase() : '',
      user: user,
      activeTab: null,
      enable: {},
      stationCS: null,
      stationTitle: null,
      stationInfo: null,
      stationSettings: null,
      statusService: statusService,
      logService: logService,
      statusData: {}
    }
  },
  mounted () {
    const vm = this
    stationSettings.load()
      .then( function () {
        vm.stationCS = stationSettings.data.station.callsign
        vm.stationTitle = stationSettings.data.station.title
        vm.enable = stationSettings.data.enable
        vm.stationSettings = stationSettings.data
        if ( stationSettings.data.enable.stationInfo ) {
          vm.stationInfo = stationSettings.data.station.info
        }
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
        vm.postUserActivity()
      })
      .catch( function () {
        window.location.href = '/'
      })
    statusService.onUpdate( function () {
      vm.statusData = statusService.data
      vm.updateOnline()
    })
    statusService.load()
    vm.statusUpdateInd = setInterval( statusService.load, statusUpdateInt )
    vm.userActivityPostIntId = setInterval( vm.postUserActivity, userActivityPostInt )
    vm.updateOnlineIntId = setInterval( vm.updateOnline, 1000 )
    for (const id in vm.tabs) {
      const tab = vm.tabs[id]
      tab.service.load()
      tab.intervalId = setInterval( tab.service.load, tab.interval )
      tab.service.onUpdate( function () {
        tab.updated = tab.service.lastModified
        vm.tabUnread( id )
      })
    }
  },
  beforeDestroy () {
    for (const id in this.tabs) {
      clearInterval( this.tabs[id].intervalId )
    }
    clearInterval( this.userActivityPostIntId )
    clearInterval( this.statusUpdateIntId )
    clearInterval( this.updateOnlineIntId )
  },
  watch: {
    tabsUnread: {
      handler:
        function (oldV, newV) {
     //     console.log( oldV )
     //     console.log( newV )
        },
      deep: true
    }
  },
  methods: {
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
      this.postUserActivity()
    },
    tabUnread ( id ) {
      const tab = this.tabs[id]
      this.$set( this.tabsUnread, id,
        tab.updated
        ? tab.updated !== tab.read && tab.service.data.length > 0
        : false )
    },
    postUserActivity ( typing ) {
      if (this.chatUser && this.stationSettings) {
        user.serverPost( 'activeUsers',
          { 'station': this.stationSettings.station.callsign,
            'chat': this.activeTab === 'chat',
            'user': this.chatUser,
            'typing': Boolean( typing ) }, true )
      }
    },
    setChatUser ( chatUser ) {
      if (this.chatUser !== chatUser) {
        this.$set( this, 'chatUser', chatUser )
        storage.save( chatUserStorageKey, chatUser, 'local' )
        this.postUserActivity()
      }
    },
    updateOnline () {
      if (!this.stationSettings) {
        return
      }
      const online = this.stationSettings.status.get === 'manual' ? this.statusData.online
        : ( ( Date.now() / 1000 ) - this.statusData.ts ) < onlineInt[this.stationSettings.status.get]
      if ( online !== this.statusData.online ) {
        this.$set( this.statusData, 'online', online )
      }
    },
    formatDate (dt) {
      return moment(dt).format( 'DD MMM YYYY' ).toLowerCase()
    }
  }
}
</script>

<style>
.delete_btn {
    width: 20px;
    height: 20px;
    display: none;
}

.can_delete img{
    display: inline;
}
</style>
