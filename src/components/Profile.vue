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
                <a href="/static/html/log.html" target="_blank" rel="noopener" class="blue">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                    <b>Info</b>: <u>The scheme of your weblog's broadcasting</u>.
                </a>
                <br/>
                <a href="https://n1mm.hamdocs.com/tiki-index.php" target="_blank" rel="noopener" class="blue">
                    <u><b>N1MM Log</b></u></a> website. &nbsp; 
                <a href="http://tnxqso.com/static/files/qsoclient.zip" rel="noopener" class="blue">
                    <u><b>QSOclient</b></u></a> download.  &nbsp; 
                <a href="https://play.google.com/store/apps/details?id=com.jillybunch.shareGPS" target="_blank" rel="noopener" class="blue">
                    <u><b>Share GPS</b></u></a> and <a href="https://play.google.com/store/apps/details?id=com.mendhak.gpslogger" target="_blank" rel="noopener" class="blue">
                    <u><b>GPS Logger</b></u></a> at GooglePlay.                
            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='<b>Publish... </b> - Set a mark for the publication of your expedition in the stations\'s list on the homepage. <br/>Set the mark only when your <b>Station\'s link</b> is completely ready.<br/><b>Station\'s link is a direct link to the page of your expedition/station </b>. There is convenient to use this link for sharing in social nets/forums/clusters.<br/><hr/><b>Publish...</b> - Поставьте отметку для публикации вашей экспедиции в списке станций на главной странице. <br/>Отметку ставьте после того, как ваша страница по <b>Station\'s link</b> полностью готова.<br/><b>Station\'s link - это прямая ссылка на страницу вашей экспедиции/станции</b>.<br/>Для распространения в соц.сетях/форумах/кластерах удобно использовать именное её.'">
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
                    @click="infoPopup='<b>Take status from:</b> - Choose from where we will receive information that the station is ONLINE or OFFLINE.<br/> <b>Manual</b> - manual status setting. <i>(Do not forget to click the Save all info button.) </i><br/><b>Show on this tab:</b> - You can select the data that will be broadcast on this tab.<br/><hr/><b>Take status from:</b> - Выберите откуда будем поступать информация о том, что станция ONLINE или OFFLINE.<br/><b>Manual</b> - ручная установка статуса. <i>(Не забудьте нажать кнопку Save all info.)</i><br/><b>Show on this tab:</b> - Можно выбрать данные, которые будут транслироваться на этой вкладке.'">
                <input type="checkbox" id="checkbox_status" checked disabled/> Show the <b>ONLINE/OFFLINE</b> tab on the station's page
                <div class="block_settings">
                    <u>Take ONLINE/OFFLINE status from</u>: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <input type="radio" name="status_from" v-model="settings.status.get" value="qsoclient"/> 
                    QSOclient &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                    <input type="radio" name="status_from" v-model="settings.status.get" value="gpslogger"/> 
                    GPS Logger &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="radio" name="status_from" v-model="settings.status.get" value="manual"/> 
                    Manual
                    <span id="manual_status" v-if="settings.status.get === 'manual'">
                        : &nbsp; 
                        <input type="radio" name="status_manual" v-model="status.online" :value="true">
                        <span style="color: green; font-weight: bold;">ONLINE</span> &nbsp; 
                        <input type="radio" name="status_manual" v-model="status.online" :value="false"/>
                        <span style="color: red; font-weight: bold;">OFFLINE</span>
                    </span>
                    <br/><br/>
                    <table id="status_setup">
                        <tr>
                            <td class="col1"><u>Show on this tab:</u></td>
                            <td>&nbsp;</td>
                        </tr>
                        <tr>
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_rda" 
                                    v-model="settings.status.fields.RDA"/> RDA
                            </td>
                            <td>
                                <input type="text" id="status_manual_rda" v-model="status.rda" 
                                    :disabled="settings.status.get === 'qsoclient'" />
                            </td>
                        </tr>
                        <tr>
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_rafa" 
                                    v-model="settings.status.fields.RAFA"/> RAFA
                            </td>
                            <td>
                                <input type="text" id="status_manual_rafa" v-model="status.rafa"
                                    :disabled="settings.status.get === 'qsoclient' || 
                                    settings.status.get === 'gpslogger' " />
                            </td>
                        </tr>
                        <tr>
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_wff" 
                                    v-model="settings.status.fields.WFF"/> WFF
                            </td>
                            <td>
                                <input type="text" id="status_manual_wff" v-model="status.wff" 
                                    :disabled="settings.status.get === 'qsoclient'" />
                            </td>
                        </tr>
                        <tr>
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_loc" 
                                    v-model="settings.status.fields.loc"/> Locator
                            </td>
                            <td>
                                <input type="text" id="status_manual_locator" v-model="status.loc" 
                                    :disabled="settings.status.get === 'qsoclient' || 
                                    settings.status.get === 'gpslogger'" />
                            </td>
                        </tr>
                        <tr v-for="n in $options.USER_FIELDS_COUNT">
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_user1" 
                                    v-model="settings.status.userFields[n-1]"/> 
                                <input type="text" id="status_manual_user2" 
                                    :disabled="settings.status.get === 'qsoclient'" 
                                    v-model="settings.userFields[n-1]" 
                                    :placeholder="'User field #' + n"/>
                            </td>
                            <td>
                                <input type="text" id="status_manual_user1" 
                                    :disabled="settings.status.get === 'qsoclient'" 
                                    v-model="status.userFields[n-1]"
                                    />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>


            <div class="station_setup_block">
                <a href="/static/html/map.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> Show the <b>Map</b> tab on the station's page<br/>
                <a href="/static/html/map.html" target="_blank" rel="noopener" class="blue">
                    <b>Info</b>: <u>Route's (geo marker's) creation by using Google Maps</u>
                </a><br/>
                <template v-if="settings.enable.map">
                        <table id="custom_mark">
                            <tr>
                                <td colspan="10"><u>Select a mark for your station on the map</u></td>
                            </tr>
                            <tr>
                                <td v-for="n in $options.CURRENT_POSITION_ICONS_COUNT">
                                    <img :src="'/static/images/icon_map_' + ( n - 1 ) + '.png'" 
                                        @click="settings.currentPositionIcon = n - 1"/><br/>
                                    <input type="radio" v-model="settings.currentPositionIcon" 
                                        :value="n - 1"/>
                                </td>
                            </tr>
                        </table>
                        <table id="manual_gps">
                            <tr>
                                <td colspan="3"><u>Manual setting of your station's coordinates</u></td>
                            </tr>
                            <tr>
                                <td class="note">Latitude</td>
                                <td class="note">Longitude</td>
                                <td class="note">Comment</td>
                            </tr>
                            <tr>                            
                                <td><input type="number" v-model="status.location[0]"></td>
                                <td><input type="number" v-model="status.location[1]"></td>
                                <td><input type="text" v-model="status.comments"></td>
                            </tr>
                            <tr>                            
                                <td class="note" colspan="3">Coordinates format: &nbsp;&nbsp;&nbsp; 12,345678</td>
                            </tr>
                        </table>

                    <b>Uploaded file</b>: {{trackFile ? trackFile : '...'}}<br/>
                    <div class="block_settings">
                        <input type="file" id="fileTrack" style="display:none" @change="uploadTrack">
                        <label class="btn" for="fileTrack" :disabled="!user.stationCallsign">
                            Upload KML/KMZ/GPX file with expedition's route or geo marker
                        </label> &nbsp; 
                        <input type="button" id="button_clear_track" class="btn" value="Delete file"
                            v-if="user.stationCallsign && trackFile"
                            @click="clearTrack()"/><br/><br/>
                    </div>
                </template>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='Mark those columns of the log that will be broadcast to the site. <br/> The names of the user columns and their values can be changed in the QSOclient program or in the ONLINE/OFFLINE tab settings.<br/><hr/>Отметьте те колонки лога, которые будут транслироваться на сайт.<br/>Названия пользовательских колонок изменяются в программе QSOclient или в настройках вкладки ONLINE/OFFLINE.'">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" />
                Show the <b>Online log</b> tab on the station's page <br/> 
                <!--template v-if="settings.enable.log">
                    <input type="checkbox" id="checkbox_log" v-model="settings.enable.stats"/>
                    Show the <b>Stats</b> tab on the station's page 
                </template-->
                <div class="block_settings" v-if="settings.enable.log">
                    <table id="log_setup">
                        <tr>
                            <td><u>Show in the log</u>:</td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_rda" v-model="settings.log.columns.RDA" />
                                RDA
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_rafa" v-model="settings.log.columns.RAFA" />
                                RAFA
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_wff" v-model="settings.log.columns.WFF" />
                                WFF
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_loc" v-model="settings.log.columns.loc" />
                                Locator
                            </td>
                            <td class="setting" v-for="n in $options.USER_FIELDS_COUNT">
                                <input type="checkbox" :id="'user_field' + n" 
                                    v-model="settings.log.userColumns[n-1].enabled"/>
                                {{settings.userFields[n-1] ? settings.userFields[n-1] : 'User field #' + n}}<br/>
                            </td>
                        </tr>
                    </table>
                    <input type="button" id="button_clear_log" class="btn" value="Clear online log" 
                        :disabled="!user.stationCallsign"
                        @click="clearLog()"/>
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='<b>The INFO tab</b> It\'s appropriate to place the common information and photos with the description of the expedition\'s purpose , operators, the route of the expedition etc.<br/><hr/>Во вкладке <b>INFO</b> уместно разместить общую информацию и фото с описанием цели, состава операторов, маршрута экспедиции/станции.'">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> Show the <b>Info</b> tab on the station's page<br/><br/>
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <vue-editor id="editor_info" v-model="settings.station.info" 
                        :editorToolbar="editorToolbar"></vue-editor><br/>
                </div>
            </div>
            
<!--
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='<b>The NEWS tab</b>. Adding current reports of the work of the expedition/station to the website.<br/><hr/>Вкладка <b>NEWS</b> - добавление на сайт оперативных сообщений о работе экспедиции/станции.'">
                <input type="checkbox" id="checkbox_news" v-model="settings.enable.news" /> Show the <b>News</b> tab on the station's page
                <div class="block_settings" v-if="settings.enable.news">
                    <input type="button" id="button_clear_news" class="btn" value="Clear all news"
                         :disabled="!user.stationCallsign"
                        @click="clearNews()"/><br/><br/>
                    <vue-editor id="editor_news" 
                        v-model="newsItem" :editorToolbar="editorToolbar"></vue-editor>
                    <input type="button" id="button_post_news" class="btn" value="Post news"
                        :disabled="!user.stationCallsign"
                        @click="postNewsItem()"/><br/>
                </div>
            </div>
-->

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='<b>Callsigns to track</b> - The callsigns specified in this section will be tracked in the cluster\'s spots and broadcast to the <b> ADXCLUSTER </b> tab. You can specify either the specific callsign (R7AB or R7AB/M) and the callsign\'s group, using the & laquo; asterisk & raquo; (*/P - all the callsigns with /P).<br/><b>Highlight callsign...</b> - the callsigns specified in this section will be highlighted in color (For example, in tracking we specify */P, and here we write R7AB*.)<br/><hr/><b>Callsigns to track</b> - Позывные, указанные в этом разделе, будут отслеживаться в спотах кластера и транслироваться на вкладке <b>ADXCLUSTER</b>. Указывать можно как конкретный позывной (R7AB или R7AB/M), так и группу позывных, используя &laquo;звездочку&raquo; (*/P - все позывные /P).<br/><b>Highlight callsign...</b> - позывные, указанные в этом разделе, будут выделяться цветом (Например, в отслеживании указываем */P, а здесь пишем R7AB*.)'">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> Show the <b>ADXcluster</b> tab on the station's page 
                <div class="block_settings" v-if="settings.enable.cluster">
                Callsigns to track ( separeted by spaces or commas):<br/>
                <input type="text" id="setup_cluster" v-model="clusterCallsigns" 
                    @change="clusterCallsignsChange"/><br/>
                Highlight callsign with color:<br/>
                <input type="text" id="highlight_calls" v-model="clusterHighlight" 
                    @change="clusterHighlightChange" />
                </div>

            </div>

            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='The <b>CHAT</b> tab. Callsigns specified in this section highlighted in color. Only the administrator of the station can delete chat messages.<br/><hr/>Вкладка <b>CHAT</b>. Позывные, указанные в этом разделе, выделяются цветом на странице чата. Удалять сообщения чата может только администратор станции.'">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> Show the <b>Chat</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.chat">
                    Highlighted callsigns: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins" 
                        @change="chatAdminsChange" /><br/>
                    <input type="button" id="button_clear_chat" class="btn" value="Clear chat"
                        @click="clearChat()"/>
                </div>
            </div>


            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info" 
                    @click="infoPopup='The <b>INSTAGRAM</b> tab. Broadcasting the photo/video of the selected Instargam account to your station page.<br/><hr/>Вкладка <b>INSTAGRAM</b> - трансляция фото/видео выбранного аккаунта Instargam на страницу вашей станции.'">
                <input type="checkbox" id="checkbox_instagram" v-model="settings.enable.instagram" /> Show the <b>Instagram</b> tab on the station's page<br/>
                <div class="block_settings" v-if="settings.enable.instagram">
                    Instagram ID: <input type="text" id="setup_instagram" v-model="settings.instagramID"/>
                </div>
            </div>


            <div class="station_setup_block">
                <a href="/static/html/support_us.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
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
import {USER_FIELDS_COUNT, CURRENT_POSITION_ICONS_COUNT} from '../constants'

import router from '../router'
import {VueEditor} from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import {parseCallsigns, getStationURL} from '../utils'
import request from '../request'
import statusService from '../status-service'
import trackService from '../track-service'

const STATUS_FIELDS = [ 'rda', 'rafa', 'wff', 'loc', 'comments' ]
const STATUS_ARRAY_FIELDS = [ 'userFields', 'location' ]
const STATUS_BOOL_FIELDS = [ 'online' ]

export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  CURRENT_POSITION_ICONS_COUNT: CURRENT_POSITION_ICONS_COUNT,
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
  mounted () {
    const vm = this
    statusService.onUpdate( function () {
      const data = statusService.data
      if (Object.keys(data).length !== 0) {
        STATUS_FIELDS.forEach( f => {
          vm.$set( vm.status, f, data[f] )
        })
        STATUS_ARRAY_FIELDS.forEach( f => {
          if ( f in data ) {
            vm.$set( vm.status, f, data[f] )
          } else {
            const l = vm.status[f].length
            for ( let c = 0; c < l; c++ ) {
              vm.$set( vm.status[f], c, null )
            }
          }
        })
        STATUS_BOOL_FIELDS.forEach( f => {
          vm.status[f] = Boolean( data[f] )
        })
      }
    })
    statusService.load()
    trackService.onUpdate( function () {
      vm.trackFile = trackService.data.filename
    })
    trackService.load()
  },
  data () {
    const settings = this.user.settings()
    if (this.user.stationCallsign) {
      settings.station.callsign = this.user.stationCallsign.toUpperCase()
    } else {
      settings.station.callsign = this.user.callsign.toUpperCase()
    }
    const userFields = []
    for ( let c = 0; c < USER_FIELDS_COUNT; c++ ) {
      userFields.push( null )
    }
    return {
      settings: settings,
      newsItem: '',
      clusterCallsigns: settings.clusterCallsigns != null ? settings.clusterCallsigns.join(' ') : null,
      clusterHighlight: settings.clusterHighlight != null ? settings.clusterHighlight.join(' ') : null,
      chatAdmins: settings.chatAdmins.join(' '),
      infoPopup: null,
      trackFile: null,
      status: {
        rda: null,
        rafa: null,
        wff: null,
        loc: null,
        userFields: userFields,
        online: false,
        location: [ null, null ],
        comments: null
      },
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
      return getStationURL(this.settings.station.callsign)
    }
  },
  methods: {
    logout () {
      this.user.logout()
      this.$router.push( '/login' )
    },
    saveSettings () {
      if (this.settings.station.info.length + this.settings.donate.text.length > 524288) {
        alert('The size limit for all your station information is 1 Megabyte.\n' +
                'Please reduce the quantity and size of your images.\n' +
                'Максимальный допустимый размер всех ваших данных - 1 мегабайт.\n' +
                'Пожалуйста, уменьшите количество и объем изображений')
        return
      }
      const vm = this
      let clearAll = false

      this.settings.station.callsign = this.settings.station.callsign.toUpperCase()
      if (this.user.stationCallsign &&
        this.user.stationCallsign !== this.settings.station.callsign) {
        if ( !window.confirm( 'The station callsign change will clear all of the station archive. ' +
          'No recovery will be possible. Do you really want to continue?\n' +
          'При смене позывного станции будут удалены все архивы станции без возможности ' +
          'восстановления. Продолжить?' ) ) {
          return
        }
        clearAll = true
      }
      this.user.saveSettings(this.settings)
        .then( function () {
          window.alert( 'Your settings were saved.' )
          if (clearAll) {
            vm.trackFile = null
          } else {
            if ( vm.settings.status.get !== 'qsoclient' ) {
              const st = JSON.parse( JSON.stringify( vm.status ) )
              if ( st.location[0] && st.location[1] ) {
                st.location[0] = Number( st.location[0] )
                st.location[1] = Number( st.location[1] )
              } else {
                st.location = null
              }
              vm.user.serverPost( 'location', st )
            }
          }
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
        const vm = this
        this.user.serverPost( 'track', { clear: 1 } )
          .then( function () {
            vm.trackFile = null
          })
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
              trackService.load()
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
      this.user.serverPost( 'news', { station: this.user.stationCallsign, add: vm.newsItem } )
        .then( function () {
          vm.newsItem = ''
        })
    },
    clusterCallsignsChange () {
      this.settings.clusterCallsigns = parseCallsigns(this.clusterCallsigns)
    },
    clusterHighlightChange () {
      this.settings.clusterHighlight = parseCallsigns(this.clusterHighlight)
    },
    chatAdminsChange () {
      this.settings.chatAdmins = parseCallsigns(this.chatAdmins)
    },
    clearAll () {
      if (window.confirm( 'Do you really want to reset all station settings?') ) {
        const vm = this
        request.get( '/static/js/defaultUserSettings.json' )
          .then( function (response) {
            vm.settings = response.data
            vm.chatAdmins = ''
            vm.clusterCallsigns = ''
          })
        request.get( '/static/js/defaultStationStatus.json' )
          .then( function (response) {
            vm.status = response.data
          })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
