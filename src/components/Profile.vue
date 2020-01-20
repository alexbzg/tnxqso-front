<template>
    <div>
         <div id="station_menu">
            <input type="button" id="button_clear_all" class="btn"
                :value="getString('CLEAR_ALL')" @click="clearAll()"/>
            <input type="button" id="button_info" class="btn" :value="getString('HOW_TO_TRACK_BTN')"
                @click="openMap()"/>
            <router-link to="/changePassword" tag="input" type="button" id="button_change_email"
                class="btn" :value="getString('CHANGE_EMAIL')"/>
            <input type="button" id="button_change_email" class="btn" value="Logout" @click="logout()"/>
        </div>

        <div id="station_setup">

            <!-- STATION -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup = getString('POPUP_STATION')">
                {{getString('STATION_CALLSIGN')}}:
                <input type="text" id="station_callsign" v-model="settings.station.callsign"/>
                <span id="stations_link">
                    {{getString('STATION_LINK')}}: <a :href="stationLink" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                {{getString('STATION_TITLE')}}: <input type="text" id="station_name" v-model="settings.station.title"/><br/>
                {{getString('STATION_PERIOD')}}:
                    <date-picker v-model="settings.station.activityPeriod" format="dd.MM.yyyy"
                        range confirm :lang="language"></date-picker>
                    </select><br/>
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> <b>{{getString('STATION_SHOW')}}</b> {{getString('STATION_VIEW')}}

            </div>

            <!-- STATUS -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('POPUP_STATUS')">
                <!--<input type="checkbox" id="checkbox_status" checked disabled/> Показывать <b>ONLINE/OFFLINE</b> вкладку на странице станции -->
                <div class="block_settings">
                    <u>{{getString('STATUS_FROM')}}</u>: &nbsp;&nbsp;&nbsp;&nbsp;
                    <!--
                    <input type="radio" name="status_from" v-model="settings.status.get" value="qsoclient"/>
                    TNXLOG &nbsp;&nbsp;&nbsp;&nbsp;
                    -->
                    <input type="radio" name="status_from" v-model="settings.status.get" value="gpslogger"/>
                    TNXLOG / QTHnow &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="radio" name="status_from" v-model="settings.status.get" value="manual"/>
                    {{getString('STATUS_MANUAL')}}
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
                            <td class="col1"><u>{{getString('STATUS_VIEW')}}:</u></td>
                            <td>&nbsp;</td>
                        </tr>
                        <tr>
                            <td class="col1">
                                <input type="checkbox" id="checkbox_status_rda"
                                    v-model="settings.status.fields.RDA"/> RDA
                            </td>
                            <td>
                                <input type="text" id="status_manual_rda" v-model="status.rda"
                                    :disabled="settings.status.get === 'qsoclient' ||
                                    settings.status.get === 'gpslogger'" />
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
                                User field
                            </td>
                            <td>
                                <input type="text" id="status_manual_user1"
                                    :disabled="settings.status.get !== 'manual'"
                                    v-model="status.userFields[n-1]"
                                    />
                            </td>
                        </tr>
                    </table>
                </div>
            </div>


            <!-- MAP -->
            <div class="station_setup_block">
                <a href="/static/html/map.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
                <input type="checkbox" id="checkbox_map" v-model="settings.enable.map" /> <span v-html="getString('MAP_SHOW')"/><br/>

                <template v-if="settings.enable.map">
                        <table id="custom_mark">
                            <tr>
                                <td colspan="10"><u>{{getString('MAP_ICON')}}</u></td>
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

                    <b>{{getString('MAP_FILE')}}</b>: {{trackFile ? trackFile : '...'}}<br/>
                    <div class="block_settings">
                        <input type="file" id="fileTrack" style="display:none" @change="uploadTrack">
                        <label class="btn" for="fileTrack" :disabled="!user.stationCallsign">
                            {{getString('MAP_UPLOAD')}}
                        </label> &nbsp;
                        <input type="button" id="button_clear_track" class="btn" :value="getString('MAP_CLEAR')"
                            v-if="stationCallsign && trackFile"
                            @click="clearTrack()"/><br/><br/>
                    </div>

                    <table id="manual_gps" style="display: none;">
                            <tr>
                                <td colspan="3"><u>Указание координат станции вручную</u></td>
                            </tr>
                            <tr>
                                <td class="note">Широта</td>
                                <td class="note">Долгота</td>
                                <td class="note">Комментарий</td>
                            </tr>
                            <tr>
                                <td><input type="number" v-model="status.location[0]"
                                    :disabled="settings.status.get !== 'manual'">
                                </td>
                                <td><input type="number" v-model="status.location[1]"
                                    :disabled="settings.status.get !== 'manual'">
                                </td>
                                <td><input type="text" v-model="status.comments"
                                    :disabled="settings.status.get !== 'manual'">
                                </td>
                            </tr>
                            <tr>
                                <td class="note" colspan="3">формат коодинат: &nbsp;&nbsp;&nbsp; 12,345678</td>
                            </tr>
                        </table>

                </template>
            </div>


            <!-- LOG -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup = getString('LOG_POPUP')">
                <input type="checkbox" id="checkbox_log" v-model="settings.enable.log" /> <span v-html="getString('LOG_SHOW')"/><br/>

                <div class="block_settings" v-if="settings.enable.log">
                    <table id="log_setup">
                        <tr>
                            <td><u>{{getString('LOG_COLUMNS')}}</u>:</td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_rda" v-model="settings.log.columns.RDA" />
                                RDA
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_rafa" v-model="settings.log.columns.RAFA" />
                                RAFA
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_loc" v-model="settings.log.columns.loc" />
                                Locator
                            </td>
                            <td class="setting" v-for="n in $options.USER_FIELDS_COUNT">
                                <input type="checkbox" :id="'user_field' + n"
                                    v-model="settings.log.userColumns[n-1]"/>
                                User field
                            </td>
                        </tr>
                    </table>
                    <input type="button" id="button_clear_log" class="btn" :value="getString('LOG_CLEAR')"
                        :disabled="!stationCallsign"
                        @click="clearLog()"/>
                </div>
            </div>


            <!-- INFO -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('INFO_POPUP')">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> <span v-html="getString('INFO_SHOW')"/><br/><br/>
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <vue-editor id="editor_info" v-model="settings.station.info"
                        :editorToolbar="editorToolbar"></vue-editor><br/>
                </div>
            </div>

            <!-- CLUSTER -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('CLUSTER_POPUP')">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> <span v-html="getString('CLUSTER_SHOW')"/>
                <div class="block_settings" v-if="settings.enable.cluster"><span v-html="getString('CLUSTER_FILTER')"/>:<br/>
                <input type="text" id="setup_cluster" v-model="clusterCallsigns"
                    @change="clusterCallsignsChange" value="R*/* UA*/* UB*/* UC*/* UD*/* UE*/* UF*/* UG*/* UH*/* UI*/*"/><br/>
                <span v-html="getString('CLUSTER_CALL')"/></i>:<br/>
                <input type="text" id="highlight_calls" v-model="clusterHighlight"
                    @change="clusterHighlightChange" />
                </div>

            </div>

            <!-- CHAT -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('CHAT_POPUP')">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> <span v-html="getString('CHAT_SHOW')"/><br/>
                <div class="block_settings" v-if="settings.enable.chat">
                    <span v-html="getString('CHAT_FILTER')"/>: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins"
                        @change="chatAdminsChange" /><br/><br/>
                    <input type="checkbox" id="checkbox_chat_delete"
                        v-model="settings.skipConfirmation.chatDelete" />
                    <span v-html="getString('CHAT_CHECK')"/><br/><br/>
                    <input type="button" id="button_clear_chat" class="btn" :value="getString('CHAT_CLEAR')"
                        @click="clearChat()"/>

                </div>
            </div>

            <!-- STATS -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('STATS_POPUP')">
                <input type="checkbox" id="checkbox_stats" v-model="settings.enable.stats" /> <span v-html="getString('STATS_SHOW')"/><br/>
            </div>

            <!-- GALLERY -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('GALLERY_POPUP')">
                <input type="checkbox" id="checkbox_gallery" v-model="settings.enable.gallery" /> <span v-html="getString('GALLERY_SHOW')"/><br/>
                <div class="block_settings" v-if="settings.enable.gallery">
                    <br/>
                    <input type="checkbox" id="checkbox_gallery_delete"
                        v-model="settings.skipConfirmation.galleryDelete" />
                    <span v-html="getString('GALLERY_CHECK')"/><br/><br/>
                    <input type="button" id="button_clear_photos" class="btn" :value="getString('GALLERY_CLEAR')"
                        @click="clearGallery"/>

                </div>
            </div>

            <!-- DONATE -->
            <div class="station_setup_block">
                <a href="/static/html/support_us.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enable.donate" /> <span v-html="getString('DONATE_SHOW')"/><br/>
                <div class="block_settings" v-if="settings.enable.donate">
                    <vue-editor id="editor_donate" v-model="settings.donate.text"
                        :editorToolbar="editorToolbar"></vue-editor>
                    <br/><br/>
                     <span v-html="getString('DONATE_CODE')"/>:<br/>
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

import {VueEditor} from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import {mapGetters, mapActions, mapMutations} from 'vuex'

import {parseCallsigns, getStationURL} from '../utils'
import {validCallsignFull} from '../ham-radio'
import router from '../router'
import request from '../request'
import LocalizationMixin from '../localization-mixin'

import {MUTATE_USER, ACTION_SAVE_SETTINGS, ACTION_POST} from '../store-user'

const STATUS_FIELDS = [ 'rda', 'rafa', 'wff', 'loc', 'comments' ]
const STATUS_ARRAY_FIELDS = [ 'userFields', 'location' ]
const STATUS_BOOL_FIELDS = [ 'online' ]

export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  CURRENT_POSITION_ICONS_COUNT: CURRENT_POSITION_ICONS_COUNT,
  name: 'profile',
  mixins: [LocalizationMixin],
  components: {
    VueEditor, DatePicker
  },
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( !vm.$store.getters.loggedIn ) {
        router.push( '/login' )
      }
    } )
  },
  data () {
    const settings = this.$store.getters.user.settings
    if (this.$store.getters.stationCallsign) {
      settings.station.callsign = this.$store.getters.stationCallsign.toUpperCase()
    } else {
      settings.station.callsign = this.$store.getters.userCallsign.toUpperCase()
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
  mounted () {
    this.loadMisc()
  },
  computed: {
    stationLink: function () {
      return getStationURL(this.settings.station.callsign)
    },
    ...mapGetters(['user', 'stationCallsign', 'userCallsign', 'loggedIn'])
  },
  watch: {
    stationCallsign () {
      this.loadMisc()
    }
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_SAVE_SETTINGS]),
    ...mapMutations([MUTATE_USER]),
    loadMisc () {
      this.loadStatus()
      this.loadTrack()
    },
    loadTrack () {
      if (this.stationCallsign) {
        request.getJSON('track', this.stationCallsign)
          .then(response => {
            this.trackFile = response.data.filename
          })
      }
    },
    loadStatus () {
      if (this.stationCallsign) {
        request.getJSON('status', this.stationCallsign)
          .then(response => {
            const data = response.data
            if (Object.keys(data).length !== 0) {
              STATUS_FIELDS.forEach( f => {
                this.$set(this.status, f, data[f])
              })
              STATUS_ARRAY_FIELDS.forEach(f => {
                if (f in data) {
                  this.$set(this.status, f, data[f])
                } else {
                  const l = this.status[f].length
                  for (let c = 0; c < l; c++) {
                    this.$set(this.status[f], c, null)
                  }
                }
              })
              STATUS_BOOL_FIELDS.forEach( f => {
                this.status[f] = Boolean(data[f])
              })
            }
          })
      }
    },
    openMap () {
      window.open('/static/html/map.html', '_blank')
    },
    logout () {
      this[MUTATE_USER]()
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
      let clearAll = false

      this.settings.station.callsign = this.settings.station.callsign.toUpperCase()
      if (!validCallsignFull(this.settings.station.callsign)) {
        alert('The expedition callsign should be valid and the only one.\n' +
            'необходимо ввести только один корректный позывной экспедициц.')
        return
      }
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
      this[ACTION_SAVE_SETTINGS](this.settings)
        .then(() => {
          window.alert( 'Your settings were saved.' )
          if (clearAll) {
            this.trackFile = null
          } else {
            if (this.settings.status.get === 'manual') {
              const st = JSON.parse(JSON.stringify(this.status))
              if (st.location[0] && st.location[1]) {
                st.location[0] = Number( st.location[0] )
                st.location[1] = Number( st.location[1] )
              } else {
                st.location = null
              }
              this[ACTION_POST]({path: 'location', data: st})
            }
          }
        })
    },
    clearChat () {
      if (window.confirm( 'Do you really want to delete all chat messages?') ) {
        this[ACTION_POST]({path: 'chat', data: {station: this.stationCallsign, clear: 1}})
      }
    },
    clearGallery () {
      if (window.confirm( 'Do you really want to delete all gallery content?') ) {
        this[ACTION_POST]({path: 'gallery', data: {clear: 1}})
      }
    },
    clearLog () {
      if (window.confirm( 'Do you really want to delete all log entries?') ) {
        this[ACTION_POST]({path: 'log', data: {clear: 1}})
      }
    },
    clearTrack () {
      if (window.confirm( 'Do you really want to clear route?') ) {
        this[ACTION_POST]({path: 'track', data: {clear: 1}})
          .then(() => {
            this.trackFile = null
          })
      }
    },
    uploadTrack (e) {
      const files = e.target.files || e.dataTransfer.files
      const el = e.target
      if (!files.length) { return }
      const reader = new FileReader()

      reader.onload = e => {
        this[ACTION_POST]({
          path: 'track',
          data: {file: e.target.result, name: files[0].name}
        })
          .then(() => {
            window.alert( 'Your route file was uploaded successfully.' )
            this.loadTrack()
          })
          .finally(() => {
            el.value = ''
          })
      }
      reader.readAsDataURL(files[0])
    },
    clearNews () {
      if (window.confirm( 'Do you really want to delete all news entries?') ) {
        this[ACTION_POST]({path: 'news', data: {station: this.user.stationCallsign, clear: 1}})
      }
    },
    postNewsItem () {
      this[ACTION_POST]({
        path: 'news',
        data: {
          station: this.stationCallsign,
          add: this.newsItem
        }
      })
        .then(() => {
          this.newsItem = ''
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
        request.get( '/static/js/defaultUserSettings.json' )
         .then(response => {
           this.settings = response.data
           this.chatAdmins = ''
           this.clusterCallsigns = ''
         })
        request.get( '/static/js/defaultStationStatus.json' )
          .then(response => {
            this.status = response.data
          })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
