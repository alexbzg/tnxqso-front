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
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> 
                Publish on TNXQSO.com main page <br/>
                Station's callsign: <input type="text" id="station_callsign" v-model="settings.stationCallsign"/> 
                <span id="stations_link">
                    Station's link: <a href="#" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                Station's title: <input type="text" id="station_name" v-model="settings.stationTitle"/><br/>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_info" checked /> Station's info
                <div class="block_settings">
                    <textarea v-model="settings.stationInfo"></textarea>
                </div>
            </div>
            
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

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" /> Online log
                <div class="block_settings" v-if="settings.enable.log">
                    View:<br/>
                    <input type="checkbox" id="checkbox_log_rda" v-model="settings.log.columns.rda" /> RDA<br/>
                    <input type="checkbox" id="checkbox_log_rafa" v-model="settings.log.columns.rafa" /> RAFA<br/>
                    <input type="checkbox" id="checkbox_log_wff" v-model="settings.log.columns.wff" /> WFF<br/>
                    <input type="checkbox" id="checkbox_log_loc" v-model="settings.log.columns.loc" /> Locator<br/>
                    <template v-for="n in 2">
                        <input type="checkbox" id="checkbox_log_loc"  v-model="settings.log.columns.user[n-1]" /> 
                        User field #{{n}} <input type="text" id="user_field1" 
                            v-model="settings.log.userColumns[n-1]" v-if="settings.log.columns.user[n-1]"/><br/>
                    </template>
                    <input type="button" id="button_clear_log" class="btn" value="Clear online log" 
                        @click="clearLog()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> Map
                <div class="block_settings" v-if="settings.enable.map">
                    <input type="button" id="button_clear_track" class="btn" 
                        value="Upload KMZ-file with track" @click="uploadTrack()"/> &nbsp; 
                    <input type="button" id="button_clear_track" class="btn" value="Clear track"
                        @click="clearTrack()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> ADXcluster
                <div class="block_settings" v-if="settings.enable.cluster">
                Callsigns to track ( separeted by spaces or commas): 
                <input type="text" id="setup_cluster" v-model="clusterCallsigns"/>
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> Chat<br/>
                <div class="block_settings" v-if="settings.enable.chat">
                    <input type="button" id="button_clear_chat" class="btn" value="Clear chat"
                        @click="clearChat()"/><br/>
                    Admin "RED" callsigns: <br/>
                    <input type="text" id="admin_calls" v-model="settings.chatAdmins"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_instagram" v-model="settings.enable.instagram" /> 
                Instagram<br/>
                <div class="block_settings" v-if="settings.enable.istagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="sttings.instagramID"/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/images/icon_info.png" title="Info">
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enabled.donate" /> 
                Support us<br/>
                <div class="block_settings" v-if="settings.enabled.donate">
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
    return {
      settings: JSON.parse( JSON.stringify( this.$root.$data.user.settings ) ),
      newsItem: ''
    }
  },
  methods: {
    logout () {
      this.$root.$data.user.logout()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
