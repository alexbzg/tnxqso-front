<template>
    <div>
         <div id="station_menu">
            <input type="button" id="button_clear_all" class="btn" value="Clear all info" @click="clearAll()"/>
            <input type="button" id="button_change_email" class="btn" value="Change email"/>
            <input type="button" id="button_change_email" class="btn" value="Change password"/>
            <input type="button" id="button_change_email" class="btn" value="Logout" @click="logout()"/>
        </div>

        <div id="station_setup">
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> 
                <b>Publish</b> this station's info on the TNXQSO.com main page <br/>
                Station's callsign: <input type="text" id="station_callsign" v-model="settings.station.callsign"/> 
                <span id="stations_link">
                    Station's link: <a :href="stationLink" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                Station's title: <input type="text" id="station_name" v-model="settings.station.title"/><br/>
                Activity period: 
                    <date-picker v-model="settings.station.activityPeriod" 
                        range lang="en"></date-picker>
                Keep station archive: 
                    <select v-model="settings.station.keepArchive">
                        <option value="false">Don't keep</option>
                        <option value="1 week">One week</option>
                        <option value="1 month">One month</option>
                        <option value="6 month">Six monthes</option>
                        <option value="1 year">One year</option>
                    </select>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> Show the <b>Info</b> tab on the station's page<br/><br/>
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <vue-editor v-model="settings.station.info" :editorToolbar="editorToolbar"></vue-editor><br/>
                </div>
            </div>
            
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_news" v-model="settings.enable.news" /> Show the <b>News</b> tab on the station's page
                <div class="block_settings" v-if="settings.enable.news">
                    <input type="button" id="button_clear_news" class="btn" value="Clear news"
                        @click="clearNews()"/><br/>
                    <vue-editor v-model="newsItem" :editorToolbar="editorToolbar"></vue-editor><br/>
                    <input type="button" id="button_post_news" class="btn" value="Post news"
                        @click="postNewsItem()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" /> Show the <b>Online log</b> tab on the station's page 
                <div class="block_settings" v-if="settings.enable.log">
                    View:<br/>
                    <input type="checkbox" id="checkbox_log_rda" v-model="settings.log.columns.RDA" /> RDA<br/>
                    <input type="checkbox" id="checkbox_log_rafa" v-model="settings.log.columns.RAFA" /> RAFA<br/>
                    <input type="checkbox" id="checkbox_log_wff" v-model="settings.log.columns.WFF" /> WFF<br/>
                    <input type="checkbox" id="checkbox_log_loc" v-model="settings.log.columns.loc" /> Locator<br/>
                    <template v-for="n in 2">
                        <input type="checkbox" :id="'checkbox_log_user' + n"  
                            v-model="settings.log.userColumns[n-1].enabled" /> 
                        User field #{{n}} <input type="text" :id="'user_field' + n" 
                            v-model="settings.log.userColumns[n-1].column" 
                            v-if="settings.log.userColumns[n-1].enabled"/><br/>
                    </template>
                    <input type="button" id="button_clear_log" class="btn" value="Clear online log" 
                        @click="clearLog()"/><br/>
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> Show the <b>Map</b> tab on the station's page
                <div class="block_settings" v-if="settings.enable.map">
                    <input type="file" id="fileTrack" style="display:none" @change="uploadTrack">
                    <label class="btn" for="fileTrack">Upload XML-file with track</label> &nbsp; 
                    <input type="button" id="button_clear_track" class="btn" value="Clear track"
                        @click="clearTrack()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> Show the <b>ADXcluster</b> tab on the station's page 
                <div class="block_settings" v-if="settings.enable.cluster">
                Callsigns to track ( separeted by spaces or commas): 
                <input type="text" id="setup_cluster" v-model="clusterCallsigns" 
                    @change="clusterCallsignsChange"/>
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> Show the <b>Chat</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.chat">
                    <input type="button" id="button_clear_chat" class="btn" value="Clear chat"
                        @click="clearChat()"/><br/>
                    Admin "RED" callsigns: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins" 
                        @change="chatAdminsChange" />
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_instagram" v-model="settings.enable.instagram" /> Show the <b>Instagram</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.instagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="settings.instagramID"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enable.donate" /> Show <b>Support us</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.donate">
                    <vue-editor v-model="settings.donate.text" :editorToolbar="editorToolbar"></vue-editor>
                    <br/><br/>
                    Code from payment system:<br/> 
                    <textarea v-model="settings.donate.code"></textarea>
                </div>
            </div>
            <br/><br/> 
            <input type="button" id="button_save_all" class="btn" value="Save all info"
                @click="saveSettings()"/>
            
        </div>


    </div>
       
</template>

<script>
import router from './../router'
import {VueEditor} from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import {parseCallsigns} from './../utils'
import request from './../request'
export default {
  name: 'profile',
  props: ['user'],
  components: {
    VueEditor, DatePicker
  },
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( !vm.user.loggedIn ) {
        router.push( '/login' )
      }
    } )
  },
  data () {
    const settings = this.user.settings()
    return {
      settings: settings,
      newsItem: '',
      clusterCallsigns: settings.clusterCallsigns.join(' '),
      chatAdmins: settings.chatAdmins.join(' '),
      editorToolbar: [ [ 'bold', 'italic', 'underline' ],
        [ 'image' ],
        [ { 'indent': '-1' }, { 'indent': '+1' } ],
        [ { 'header': [ 1, 2, 3, 4, 5, 6, false ] } ],
        [ { 'color': [] }, { 'background': [] } ],
        [ { 'font': [] } ],
        [ { 'align': [] } ],
        [ 'clean' ]
      ]
    }
  },

  watch: {
    settings: {
      handler: function () {},
      deep: true
    }
  },

  computed: {
    stationLink: function () {
      return this.settings.station.callsign
        ? ( 'http://tnxqso.com/' +
          this.settings.station.callsign.replace( /\//, '-' ).toLowerCase() )
        : null
    }
  },
  methods: {
    logout () {
      this.user.logout()
    },
    saveSettings () {
      this.user.saveSettings(this.settings)
    },
    clearChat () {
      if (window.confirm( 'Do you really want to delete all chat messages?') ) {
        this.user.serverPost( 'chat', { clear: 1 } )
      }
    },
    clearLog () {
      if (window.confirm( 'Do you really want to delete all log entries?') ) {
        this.user.serverPost( 'log', { clear: 1 } )
      }
    },
    clearTrack () {
      if (window.confirm( 'Do you really want to clear track?') ) {
        this.user.serverPost( 'track', { clear: 1 } )
      }
    },
    uploadTrack (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) { return }
      const reader = new FileReader()
      const vm = this

      reader.onload = function (e) {
        vm.user.serverPost( 'track', { file: e.target.result } )
      }
      reader.readAsDataURL(files[0])
    },
    clearNews () {
      if (window.confirm( 'Do you really want to delete all news entries?') ) {
        this.user.serverPost( 'news', { clear: 1 } )
      }
    },
    postNewsItem () {
      const vm = this
      this.user.serverPost( 'news', { add: this.newsItem } )
        .then( function () {
          vm.newsItem = ''
        })
    },
    clusterCallsignsChange () {
      this.settings.clusterCallsigns = parseCallsigns(this.clusterCallsigns)
    },
    chatAdminsChange () {
      this.settings.chatAdmins = parseCallsigns(this.chatAdmins)
    },
    clearAll () {
      if (window.confirm( 'Do you really want to reset all station settings?') ) {
        const vm = this
        request.get( '/static/js/defaultUserSettings.json' )
          .then( function (response) {
            console.log( response.data )
            vm.settings = response.data
            vm.chatAdmins = ''
            vm.clusterCallsigns = ''
          })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
