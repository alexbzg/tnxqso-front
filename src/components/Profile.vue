<template>
    <div>
         <div id="station_menu">
            <input type="button" id="button_clear_all" class="btn" value="Clear all info"/>
            <input type="button" id="button_change_email" class="btn" value="Change email"/>
            <input type="button" id="button_change_email" class="btn" value="Change password"/>
            <input type="button" id="button_change_email" class="btn" value="Logout" @click="logout()"/>
        </div>

        <div id="station_setup">
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> 
                Publish on TNXQSO.com main page <br/>
                Station's callsign: <input type="text" id="station_callsign" v-model="settings.station.callsign"/> 
                <span id="stations_link">
                    Station's link: <a href="#" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                Station's title: <input type="text" id="station_name" v-model="settings.station.title"/><br/>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> Station's info
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <textarea v-model="settings.station.info"></textarea>
                </div>
            </div>
            
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_news" v-model="settings.enable.news" /> News
                <div class="block_settings" v-if="settings.enable.news">
                    <input type="button" id="button_clear_news" class="btn" value="Clear news"
                        @click="clearNews()"/><br/>
                    <vue-editor v-model="newsItem"></vue-editor><br/>
                    <input type="button" id="button_post_news" class="btn" value="Post news"
                        @click="postNewsItem()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" /> Online log
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
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> Map
                <div class="block_settings" v-if="settings.enable.map">
                    <input type="button" id="button_upload_track" class="btn" 
                        value="Upload KMZ-file with track" @click="uploadTrack()"/> &nbsp; 
                    <input type="button" id="button_clear_track" class="btn" value="Clear track"
                        @click="clearTrack()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> ADXcluster
                <div class="block_settings" v-if="settings.enable.cluster">
                Callsigns to track ( separeted by spaces or commas): 
                <input type="text" id="setup_cluster" v-model="clusterCallsigns" 
                    @change="clusterCallsignsChange"/>
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> Chat<br/>
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
                <input type="checkbox" id="checkbox_instagram" v-model="settings.enable.instagram" /> 
                Instagram<br/>
                <div class="block_settings" v-if="settings.enable.instagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="settings.instagramID"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enable.donate" /> 
                Support us<br/>
                <div class="block_settings" v-if="settings.enable.donate">
                    <textarea v-model="settings.donate.text"></textarea><br/><br/>
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
import {parseCallsigns} from './../utils'
export default {
  name: 'profile',
  components: {
    VueEditor
  },
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( !vm.$root.$data.user.loggedIn ) {
        router.push( '/login' )
      }
    } )
  },
  data () {
    const user = this.$root.$data.user
    const settings = user.settings()
    return {
      user: user,
      settings: settings,
      newsItem: '',
      clusterCallsigns: settings.clusterCallsigns.join(' '),
      chatAdmins: settings.chatAdmins.join(' ')
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
    },
    clearLog () {
    },
    clearTrack () {
    },
    uploadTrack () {
    },
    clearNews () {
      if (window.confirm( 'Do you really want to delete all news items?') ) {
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
