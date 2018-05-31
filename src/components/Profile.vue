<template>
    <div>
         <div id="station_menu">
            <input type="button" id="button_clear_all" class="btn" value="Clear all info" @click="clearAll()"/>
            <router-link to="/changePassword" tag="input" type="button" id="button_change_email" 
                class="btn" value="Change email/password"/>
            <!--input type="button" id="button_change_email" class="btn" value="Change password"/-->
            <input type="button" id="button_change_email" class="btn" value="Logout" @click="logout()"/>
        </div>

        <div id="station_setup">
            <div class="station_setup_block">
                <a href="/static/html/log.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                    <b>The scheme of your weblog's broadcasting</b>.<br/>
                    Схема организации web-трансляции лога станции.
                </a>
                <br/>
                <a href="https://n1mm.hamdocs.com/tiki-index.php" target="_blank" rel="noopener" class="blue">
                    <u><b>N1MM Logger+</b></u> website.</a> &nbsp; 
                <a href="http://tnxqso.com/static/files/tnxqsoClient.zip" rel="noopener" class="blue">
                    <u><b>tnxqsoClient.exe</b></u> download.</a>  &nbsp; 
                <a href="https://play.google.com/store/apps/details?id=com.jillybunch.shareGPS&hl=ru" target="_blank" rel="noopener" class="blue">
                    <u><b>Share GPS</b></u> at GooglePlay.</a>                
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='<b>Publish...</b> - Поставьте отметку для публикации вашей экспедиции в списке станций на главной странице. <br/>Отметку ставьте после того, как ваша страница по <b>Station\'s link</b> полностью готова.<br/><br/><b>Station\'s link - это прямая ссылка на страницу вашей экспедиции/станции</b>.<br/>Для распространения в соц.сетях/форумах/кластерах удобно использовать именное её.'">
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> 
                <b>Publish</b> this station's info on the TNXQSO.com main page <br/>
                Station's callsign: <input type="text" id="station_callsign" v-model="settings.station.callsign"/> 
                <span id="stations_link">
                    Station's link: <a :href="stationLink" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                Station's title: <input type="text" id="station_name" v-model="settings.station.title"/><br/>
                Activity period: 
                    <date-picker v-model="settings.station.activityPeriod" format="dd.MM.yyyy"
                        range confirm lang="en"></date-picker>
                    </select>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Во вкладке <b>INFO</b> уместно разместить текст с описанием экспедиции/станции.'">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> Show the <b>Info</b> tab on the station's page<br/><br/>
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <vue-editor id="editor_info" v-model="settings.station.info" 
                        :editorToolbar="editorToolbar"></vue-editor><br/>
                </div>
            </div>
            
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Вкладка <b>NEWS</b> - добавление на сайт оперативных сообщений о работе экспедиции/станции.'">
                <input type="checkbox" id="checkbox_news" v-model="settings.enable.news" /> Show the <b>News</b> tab on the station's page
                <div class="block_settings" v-if="settings.enable.news">
                    <input type="button" id="button_clear_news" class="btn" value="Clear news"
                         :disabled="!user.stationCallsign"
                        @click="clearNews()"/><br/>
                    <vue-editor id="editor_news" 
                        v-model="newsItem" :editorToolbar="editorToolbar"></vue-editor><br/>
                    <input type="button" id="button_post_news" class="btn" value="Post news"
                        :disabled="!user.stationCallsign"
                        @click="postNewsItem()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Отметьте те колонки лога, которые будут транслироваться на сайт.'">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" />
                Show the <b>Online log</b> tab on the station's page <br/> 
                <template v-if="settings.enable.log">
                    <input type="checkbox" id="checkbox_log" v-model="settings.enable.stats"/>
                    Show the <b>Stats</b> tab on the station's page 
                </template>
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
                        :disabled="!user.stationCallsign"
                        @click="clearLog()"/><br/>
                </div>
            </div>


            <div class="station_setup_block">
                <a href="/static/html/map.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> Show the <b>Map</b> tab on the station's page
                <div class="block_settings" v-if="settings.enable.map">
                    <input type="file" id="fileTrack" style="display:none" @change="uploadTrack">
                    <label class="btn" for="fileTrack">Upload KML/KMZ/GPX file with route</label> &nbsp; 
                    <input type="button" id="button_clear_track" class="btn" value="Clear track"
                        :disabled="!user.stationCallsign"
                        @click="clearTrack()"/><br/>
                </div>
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Позывные, указанные в этом разделе, будут транслироваться на вкладке <b>ADXCLUSTER</b>.<br/>Указывать можно как конкретный позывной (R7AB или R7AB/M), так и группу позывных, используя &laquo;звездочку&raquo; (*/P - все позывные /P).'">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> Show the <b>ADXcluster</b> tab on the station's page 
                <div class="block_settings" v-if="settings.enable.cluster">
                Callsigns to track ( separeted by spaces or commas): 
                <input type="text" id="setup_cluster" v-model="clusterCallsigns" 
                    @change="clusterCallsignsChange"/>
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Вкладка <b>CHAT</b>. Позывные, указанные в этом разделе, будут выделяться цветом на странице чата.<br/>Удалять избранные сообщения чата может только администратор станции непосредственно на странице чата.'">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> Show the <b>Chat</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.chat">
                    <input type="button" id="button_clear_chat" class="btn" value="Clear chat"
                        @click="clearChat()"/><br/>
                    Admin callsigns: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins" 
                        @change="chatAdminsChange" />
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Вкладка <b>INSTAGRAM</b> - трансляция фото/видео выбранного аккаунта Instargam на страницу вашей станции.'">
                <input type="checkbox" id="checkbox_instagram" v-model="settings.enable.instagram" /> Show the <b>Instagram</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.instagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="settings.instagramID"/>
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup='Вкладка <b>SUPPORT US</b> предназначена для размещения текста, предлагающего сделать пожертвование экспедиции/станции (в первом окне) и кода платежных систем (во втором окне).'">
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enable.donate" /> Show <b>Support us</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.donate">
                    <vue-editor id="editor_donate" v-model="settings.donate.text" 
                        :editorToolbar="editorToolbar"></vue-editor>
                    <br/><br/>
                    Code from payment system:<br/> 
                    <textarea v-model="settings.donate.code"></textarea>
                </div>
            </div>
            <br/><br/> 
            <input type="button" id="button_save_all" class="btn" value="Save all info"
                @click="saveSettings()"/>
            
        </div>

        <table id="info_popup" v-if="infoPopup">
            <tr>
                <td>
                    <table id="info_popup_close"  @click="infoPopup = null"><tr><td></td></tr></table>
                    <div id="info_popup_text" v-html="infoPopup"></div>
                </td>
            </tr>
        </table>


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
    if (settings.station.callsign) {
      settings.station.callsign = settings.station.callsign.toUpperCase()
    } else {
      settings.station.callsign = this.user.callsign.toUpperCase()
    }
    return {
      settings: settings,
      newsItem: '',
      clusterCallsigns: settings.clusterCallsigns.join(' '),
      chatAdmins: settings.chatAdmins.join(' '),
      infoPopup: null,
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
      const l = window.location
      return this.settings.station.callsign
        ? ( l.protocol + '//' + l.host + '/' +
          this.settings.station.callsign.replace( /\//, '-' ).toLowerCase() )
        : null
    }
  },
  methods: {
    logout () {
      this.user.logout()
      this.$router.push( '/login' )
    },
    saveSettings () {
      this.settings.station.callsign = this.settings.station.callsign.toUpperCase()
      if (this.user.stationCallsign &&
        this.user.stationCallsign !== this.settings.station.callsign) {
        if ( !window.confirm( 'The station callsign change will clear all of the station archive. ' +
          'No recovery will be possible. Do you really want to continue?\n' +
          'При смене позывного станции будут удалены все архивы станции без возможности ' +
          'восстановления. Продолжить?' ) ) {
          return
        }
      }
      this.user.saveSettings(this.settings)
        .then( function () {
          window.alert( 'Your settings were saved.' )
        })
    },
    clearChat () {
      if (window.confirm( 'Do you really want to delete all chat messages?') ) {
        this.user.serverPost( 'chat', { station: this.user.stationCallsign, clear: 1 } )
      }
    },
    clearLog () {
      if (window.confirm( 'Do you really want to delete all log entries?') ) {
        this.user.serverPost( 'log', { clear: 1 } )
      }
    },
    clearTrack () {
      if (window.confirm( 'Do you really want to clear route?') ) {
        this.user.serverPost( 'track', { clear: 1 } )
      }
    },
    uploadTrack (e) {
      const files = e.target.files || e.dataTransfer.files
      const el = e.target
      if (!files.length) { return }
      const reader = new FileReader()
      const vm = this

      reader.onload = function (e) {
        vm.user.serverPost( 'track',
          { file: e.target.result,
            name: files[0].name
          } )
            .then( function () {
              window.alert( 'Your route file was uploaded successfully.' )
            })
            .finally( function () {
              el.value = ''
            })
      }
      reader.readAsDataURL(files[0])
    },
    clearNews () {
      if (window.confirm( 'Do you really want to delete all news entries?') ) {
        this.user.serverPost( 'news', { station: this.user.stationCallsign, clear: 1 } )
      }
    },
    postNewsItem () {
      const vm = this
      vm.user.serverPost( 'news', { station: this.user.stationCallsign, add: vm.newsItem } )
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
