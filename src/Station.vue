<template>
    <div id="app">
     <table class="tabs">
        <tr>
            <td id="station_title">
                <h1>{{stationCS}}</h1>
                {{stationTitle}}
            </td>
        <td rowspan="2" id="status">
            <div id="status_block_top" 
                :class="{status_online: statusData.online, status_offline: !statusData.online}">
                Station <b>{{statusData.online ? 'ONLINE': 'OFFLINE'}}</b>
            </div>
            <table id="status_block_info" v-if="statusData.online"><tr>
                <td id="current_loc">
                    <span>{{statusData.date}}  {{statusData.year}} {{statusData.time}}</span><br/>
                    <template v-if="statusData.rda">RDA&nbsp;<b>{{statusData.rda}}</b><br/></template>
                    <template v-if="statusData.rafa">RAFA&nbsp;<b>{{statusData.rafa}}</b><br/></template>
                    <template v-if="statusData.loc"><b>{{statusData.loc}}</b></template>
                </td>
            </tr></table>
        </td>
    </tr>
    <tr>
        <td>
            <router-link to="/info" tag="div" id="tab_info" class="tab" 
                v-if="enable.stationInfo">Info</router-link>
            <router-link to="/news" tag="div" id="tab_news" class="tab" 
                v-if="enable.news"
                 :class="{updated_tab: tabsUnread.news }">News</router-link>
            <router-link to="/log" tag="div" id="tab_log" class="tab" 
                v-if="enable.log">Online log</router-link>
            <router-link to="/map" tag="div" id="tab_map" class="tab" 
                v-if="enable.map">Map</router-link>
            <router-link to="/adxcluster" tag="div" id="tab_adxc" class="tab" 
                v-if="enable.cluster" 
                :class="{updated_tab: tabsUnread.cluster }">ADXcluster</router-link>
            <router-link to="/chat" tag="div" id="tab_chat" class="tab" 
                v-if="enable.chat">Chat</router-link>
            <router-link to="/instagram" tag="div" id="tab_instagram" class="tab" 
                v-if="enable.instagram">Instagram</router-link>
            <router-link to="/donate" tag="div" id="tab_donate" class="tab" 
                v-if="enable.donate">Support us</router-link>
        </td>
    </tr></table>
        <div class="list">
            <router-view :station-settings="stationSettings" :user="user" :chatUser="chatUser"
            :status-service="statusService"></router-view>
        </div>
    </div>

</template>

<script>
import './style.css'
import stationSettings from './station-settings-service'
import clusterService from './cluster-service'
import newsService from './news-service'
import chatService from './chat-service'
import statusService from './status-service'
import instService from './inst-service'
import logService from './log-service'
import user from './user'
import storage from './storage'

const chatUserStorageKey = 'chatUser'
const tabsReadStorageKey = 'stationTabsRead'
const tabs = {
  cluster: { service: clusterService, interval: 60000 },
  news: { service: newsService, interval: 60000 },
  log: { service: logService, interval: 60000 },
  chat: { service: chatService, interval: 5000 },
  inst: { service: instService, interval: 60000 * 5 }
}
const onlineInt = 300
const userActivityPostInt = 60 * 1000
const statusUpdateInt = 60 * 1000

export default {
  name: 'station',
  data () {
    let tabsRead = storage.load( tabsReadStorageKey, 'local' )
    if (!tabsRead) {
      tabsRead = {}
    }
    const tabsUnread = {}
    for (const id in tabs) {
      tabs[id].updated = null
      tabsUnread[id] = false
      if ( id in tabsRead ) {
        tabs[id].read = tabsRead[id]
      }
    }
    return {
      tabs: tabs,
      tabsRead: tabsRead,
      tabsUnread: tabsUnread,
      chatUser: storage.load( chatUserStorageKey, 'local' ) || user.callsign,
      user: user,
      activeTab: null,
      enable: {},
      stationCS: null,
      stationTitle: null,
      stationInfo: null,
      stationSettings: null,
      statusService: statusService,
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
        vm.postUserActivity()
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
  methods: {
    tabRead ( id ) {
      const tab = this.tabs[id]
      if ( tab.updated && tab.read !== tab.updated ) {
        tab.read = tab.updated
        this.tabsRead[id] = tab.read
        this.tabUnread( id )
        storage.save( tabsReadStorageKey, this.tabsRead, 'local' )
      }
      this.activeTab = id
      this.postUserActivity()
    },
    tabUnread ( id ) {
      const tab = this.tabs[id]
      this.tabsUnread[id] = tab.updated ? tab.updated !== tab.read : false
    },
    postUserActivity ( typing ) {
      if (this.chatUser && this.stationSettings) {
        user.serverPost( 'activeUsers',
          { 'station': this.stationSettings.station.callsign,
            'chat': this.activeTab === 'chat',
            'user': this.chatUser,
            'typing': Boolean( typing ) } )
      }
    },
    updateOnline () {
      const online = ( ( Date.now() / 1000 ) - this.statusData.ts ) < onlineInt
      if ( online !== this.statusData.online ) {
        this.$set( this.statusData, 'online', online )
      }
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
