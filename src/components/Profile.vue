<template>
    <div>
         <div id="station_menu">
            <input type="button" id="button_clear_all" class="btn" value="Clear all info"/>
            <input type="button" id="button_change_email" class="btn" value="Change email"/>
            <input type="button" id="button_change_email" class="btn" value="Change password"/>
            <input type="button" id="button_change_email" class="btn" value="Logout" @click="logout()"/>
        </div>

        <div id="station_setup">
            <!--
            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_publish" v-model="publish"/> 
                Publish on TNXQSO.com main page <br/>
                Station's callsign: <input type="text" id="station_callsign" v-model="stationCallsign"/> 
                <span id="stations_link">
                    Station's link: <a href="#" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                Station's title: <input type="text" id="station_name" v-model="stationTitle"/><br/>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_info" checked /> Station's info
                <div class="block_settings">
                    <textarea v-model="stationInfo"></textarea>
                </div>
            </div>
            -->
            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_news" v-model="settings.enable.news" /> News
                <div class="block_settings" v-if="settings.enable.news">
                    <input type="button" id="button_clear_news" class="btn" value="Clear news"
                        @click="clearNews()"/><br/>
                    <vue-editor v-model="newsItem"></vue-editor><br/>
                    <input type="button" id="button_post_news" class="btn" value="Post news"
                        @click="postNewsItem()"/><br/>
                </div>
            </div>
            <!--

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_log" v-model="enableLog" /> Online log
                <div class="block_settings" v-if="enableLog">
                    View:<br/>
                    <input type="checkbox" id="checkbox_log_rda" v-model="logColumnsRDA" /> RDA<br/>
                    <input type="checkbox" id="checkbox_log_rafa" v-model="logColumnsRAFA" /> RAFA<br/>
                    <input type="checkbox" id="checkbox_log_wff" v-model="logColumnsWFF" /> WFF<br/>
                    <input type="checkbox" id="checkbox_log_loc" v-model="logColumnsLoc" /> Locator<br/>
                    <template v-for="n in 2">
                        <input type="checkbox" :id="'checkbox_log_user' + n"  
                            v-model="logEnableUserColumns[n-1]" /> 
                        User field #{{n}} <input type="text" :id="'user_field' + n" 
                            v-model="logUserColumns[n-1]" v-if="log.columns.user[n-1]"/><br/>
                    </template>
                    <input type="button" id="button_clear_log" class="btn" value="Clear online log" 
                        @click="clearLog()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_map" v-model="enableMap" /> Map
                <div class="block_settings" v-if="enableMap">
                    <input type="button" id="button_upload_track" class="btn" 
                        value="Upload KMZ-file with track" @click="uploadTrack()"/> &nbsp; 
                    <input type="button" id="button_clear_track" class="btn" value="Clear track"
                        @click="clearTrack()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_cluster" v-model="enableCluster" /> ADXcluster
                <div class="block_settings" v-if="enableCluster">
                Callsigns to track ( separeted by spaces or commas): 
                <input type="text" id="setup_cluster" v-model="clusterCallsigns"/>
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_chat" v-model="enableChat" /> Chat<br/>
                <div class="block_settings" v-if="enableChat">
                    <input type="button" id="button_clear_chat" class="btn" value="Clear chat"
                        @click="clearChat()"/><br/>
                    Admin "RED" callsigns: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_instagram" v-model="enableInstagram" /> 
                Instagram<br/>
                <div class="block_settings" v-if="enableInstagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="instagramID"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_support_us" v-model="enableDonate" /> 
                Support us<br/>
                <div class="block_settings" v-if="enableDonate">
                    <textarea v-model="donateText"></textarea><br/><br/>
                    Code from payment system:<br/> 
                    <textarea v-model="donateCode"></textarea>
                </div>
            </div>
            <br/><br/> 
            <input type="button" id="button_save_all" class="btn" value="Save all info"
                @click="saveSettings()"/>
            -->
            
        </div>


    </div>
       
</template>

<script>
import router from './../router'
import {VueEditor} from 'vue2-editor'
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
    let user = this.$root.$data.user
    let settings = user.settings()
    return {
      settings: user.settings(),
      newsItem: '',
      enableNews: settings.enable.news,
      enableLog: settings.enable.log,
      enableCluster: settings.enable.cluster,
      enableChat: settings.enable.chat,
      enableDonate: settings.enable.donate,
      enableMap: settings.enable.map,
      stationCallsign: settings.station.callsign,
      stationTitle: settings.station.title,
      stationInfo: settings.station.info,
      publish: settings.publish,
      logColumnsRDA: settings.log.columns.RDA,
      logColumnsRAFA: settings.log.columns.RAFA

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
      return this.stationCallsign
        ? ( 'http://tnxqso.com/' +
          this.stationCallsign.replace( /\//, '-' ).toLowerCase() )
        : null
    }
  },
  methods: {
    logout () {
      this.$root.$data.user.logout()
    },
    saveSttingss () {
    },
    clearChat () {
    },
    clearLog () {
    },
    clearTrack () {
    },
    uploadTrack () {
    },
    postNewsItem () {
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
