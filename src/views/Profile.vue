<template>
    <div>
         <div id="user_menu">
            <input type="button" id="view_setup" class="btn" :value="getString('STATION_SETUP')"
                v-if="emailConfirmed" @click="showSettingsClick"/>

            <input type="button" id="button_change_email" @click="showChangePasswordClick"
                class="btn" :value="getString('CHANGE_EMAIL')"/>

            <div id="logout" @click="logout()"><span>{{userCallsign}}</span> Logout</div>
        </div>

        <change-password v-if="showChangePassword" @password-changed="showChangePasswordClick"></change-password>

        <div id="confirm_email" v-if="!emailConfirmed && !showChangePassword">
            <p v-html="getString('CONFIRM_EMAIL_WARNING')"/>
            <input type="button" id="button_login" class="btn" :value="getString('CONFIRM_EMAIL_BUTTON')"
                @click="emailConfirmationRequest"/>
        </div>

        <div id="station_setup" v-if="showSettings && loggedIn && emailConfirmed">


            <div id="station_menu">

                <input type="button" id="button_clear_all" class="btn"
                :value="getString('CLEAR_ALL')" @click="clearAll()"/>

                <input type="button" id="button_info" class="btn" :value="getString('HOW_TO_TRACK_BTN')"
                @click="openMap()"/>

            </div>


            <!-- STATION -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup = getString('POPUP_STATION')">
                <input type="checkbox" id="checkbox_publish" v-model="settings.publish"/> 
                <b>{{getString('STATION_SHOW')}}</b> 
                {{getString('STATION_THIS')}} {{getString('STATION_VIEW')}}<br/>
                {{getString('STATION_CALLSIGN')}}:
                <input type="text" 
                    id="station_callsign" 
                    v-model="settings.station.callsign"
                    @blur="clusterFilterStationCallsign"
                    />
                &nbsp; &nbsp;
                <span id="stations_link">
                    {{getString('STATION_LINK')}}: <a :href="stationLink" target="_blank" rel="noopener">{{stationLink}}</a>
                </span><br/>
                {{getString('STATION_TITLE')}}: <input type="text" id="station_name" v-model="settings.station.title"/><br/>
                {{getString('STATION_PERIOD')}}:
                <date-picker v-model="settings.station.activityPeriod" format="DD.MM.YYYY"
                    value-type="format" range confirm :lang="language"></date-picker>
            </div>

            <!-- STATUS -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup = getString('POPUP_STATUS')">
                <span v-html="getString('STATUS_TAB')"/>
                <div class="block_settings">
                    <div id="status_from">
                        <b>{{getString('STATUS_FROM')}}</b><br/>

                        <input type="radio" name="status_from" v-model="settings.status.get" value="client"/>
                        TNXLOG (QTHnow) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                        <input type="radio" name="status_from" v-model="settings.status.get" value="manual"/>
                        {{getString('STATUS_MANUAL')}}
                        <span id="manual_status" v-if="settings.status.get === 'manual'">
                            : &nbsp;
                            <input type="radio" name="status_manual" v-model="status.online" :value="true">
                            <span style="color: green; font-weight: bold;">ONLINE</span> &nbsp;
                            <input type="radio" name="status_manual" v-model="status.online" :value="false"/>
                            <span style="color: red; font-weight: bold;">OFFLINE</span>
                        </span>
                    </div>

                    <table id="status_setup">
                        <tr>
                            <td id="qth_lines_titles">
                                <select 
                                    v-model="settings.qthCountry"
                                    @change="initClusterSettings">
                                  <option :value="null">- - - - -</option>
                                  <option v-for="(country, id) in $options.QTH_PARAMS.countries" :value="id" :key="id">
                                    {{country.title}}
                                  </option>
                                </select><br/>
                                <span v-for="field in qthFieldTitles" :key="field">
                                    {{field}}<br/>
                                </span>
                                Locator
                            </td>
                            <td id="qth_line_data">
                                <br/>
                                <span v-for="(field, idx) in qthFieldTitles" :key="field">
                                    <input type="text" :id="'qth_field' + idx"
                                        :disabled="settings.status.get !== 'manual'"
                                        v-model.trim="status.qth.fields.values[idx]"/><br/>
                                </span>
                                <input type="text" id="locator"
                                    :disabled="settings.status.get !== 'manual'"
                                    v-model.trim="status.qth.loc"/><br/>
                            </td>
                        </tr>
                    </table>

                    <br/>

                </div>
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
                            <td class="setting" v-for="(field, idx) in qthFieldTitles" :key="field">
                                <input type="checkbox" :id="'checkbox_log' + idx"
                                v-model="settings.log.columns.qth[idx]" />
                                {{field}}
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_loc" v-model="settings.log.columns.loc" />
                                Locator
                            </td>
                            <td class="setting">
                                <input type="checkbox" id="checkbox_log_audio"
                                    v-model="settings.log.columns.audio" />
                                Audio
                            </td>
                        </tr>
                    </table>
                    <input type="button" id="button_export_log" class="btn" :value="getString('LOG_DOWNLOAD')"
                        :disabled="!userStationCallsign"
                        @click="downloadLog()"/>
                    &nbsp;
                    <input type="button" id="button_clear_log" class="btn" :value="getString('LOG_CLEAR')"
                        :disabled="!userStationCallsign"
                        @click="clearLog()"/>
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
                                <td colspan="15"><u>{{getString('MAP_ICON')}}</u></td>
                            </tr>
                            <tr>
                                <td v-for="n in $options.CURRENT_POSITION_ICONS_COUNT" :key="n">
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
                        <label class="btn" for="fileTrack" :disabled="!userStationCallsign">
                            {{getString('MAP_UPLOAD')}}
                        </label> &nbsp;
                        <input type="button" id="button_clear_track" class="btn" :value="getString('MAP_CLEAR')"
                            v-if="userStationCallsign && trackFile"
                            @click="clearTrack()"/><br/><br/>
                    </div>

                </template>
            </div>


            <!-- INFO -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('INFO_POPUP')">
                <input type="checkbox" id="checkbox_info" v-model="settings.enable.stationInfo" /> <span v-html="getString('INFO_SHOW')"/><br/><br/>
                <div class="block_settings" v-if="settings.enable.stationInfo">
                    <vue-editor id="editor_info" v-model="stationFiles.stationInfo"
                        :editorToolbar="editorToolbar"></vue-editor><br/>
                </div>
            </div>

            <!-- CLUSTER -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('CLUSTER_POPUP')">
                <input type="checkbox" id="checkbox_cluster" v-model="settings.enable.cluster" /> <span v-html="getString('CLUSTER_SHOW')"/>
                <div class="block_settings" v-if="settings.enable.cluster">
                    <span v-html="getString('CLUSTER_FILTER')"/>:<br/>
                    <input 
                        type="text" 
                        id="setup_cluster" 
                        v-model.trim="clusterCallsigns"
                    /><br/>
                    <span v-html="getString('CLUSTER_CALL')"/>:<br/>
                    <input 
                        type="text" 
                        id="highlight_calls" 
                        v-model.trim="clusterHighlight"
                    />
                </div>
            </div>

            <!-- CHAT -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('CHAT_POPUP')">
                <input type="checkbox" id="checkbox_chat" v-model="settings.enable.chat" /> 
                <span v-html="getString('CHAT_SHOW')"/><br/>

                <div class="block_settings" v-if="settings.enable.chat">

                    <span v-html="getString('CHAT_ADMINS')"/>: <br/>
                    <input type="text" id="admin_calls" v-model="chatAdmins"
                        @change="chatAdminsChange" /><br/>
                    <input type="checkbox" id="checkbox_chat_delete"
                        v-model="settings.skipConfirmation.chatDelete" />
                    <span v-html="getString('CHAT_CHECK')"/><br/>
                    <input type="button" id="button_clear_chat" class="btn" :value="getString('CHAT_CLEAR')"
                        @click="clearChat()"/><br/>
                    <span v-html="getString('CHAT_HIGHLIGHT')"/>: <br/>
                    <textarea id="sponsors" v-model="sponsors"
                        @change="sponsorsChange" />

                </div>
            </div>

            <!-- STATS -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('STATS_POPUP')">
                <input type="checkbox" id="checkbox_stats" v-model="settings.enable.stats" /> <span v-html="getString('STATS_SHOW')"/><br/>
            </div>

            <!-- BLOG -->
            <div class="station_setup_block">
                <img class="icon_info" src="/static/images/icon_info.png" title="Info"
                    @click="infoPopup= getString('BLOG_POPUP')">
                <input type="checkbox" id="checkbox_blog" v-model="settings.enable.blog" /> 
                    <span v-html="getString('BLOG_SHOW')"/><br/>
                <div class="block_settings" v-if="settings.enable.blog">
                    <br/>
                    <input type="checkbox" id="checkbox_blog_delete"
                        v-model="settings.skipConfirmation.blogDelete" />
                    <span v-html="getString('BLOG_CHECK')"/><br/><br/>
                    <input type="button" id="button_clear_photos" class="btn" :value="getString('BLOG_CLEAR')"
                        @click="clearBlog"/>

                </div>
            </div>

            <!-- DONATE -->
            <div class="station_setup_block">
                <a href="/static/html/support_us.html" target="_blank" rel="noopener">
                    <img class="icon_info" src="/static/images/icon_info.png" title="Info">
                </a>
                <input type="checkbox" id="checkbox_support_us" v-model="settings.enable.donate" /> <span v-html="getString('DONATE_SHOW')"/><br/>
                <div class="block_settings" v-if="settings.enable.donate">
                    <vue-editor id="editor_donte" v-model="stationFiles.donateText"
                        :editorToolbar="editorToolbar"></vue-editor>
                    <br/><br/>
                     <span v-html="getString('DONATE_CODE')"/>:<br/>
                    <textarea v-model="stationFiles.donateCode"></textarea>
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
import {CURRENT_POSITION_ICONS_COUNT} from '../constants'

import {VueEditor} from 'vue2-editor'
import DatePicker from 'vue2-datepicker'
import 'vue2-datepicker/index.css'
import {mapGetters, mapActions} from 'vuex'

import QTH_PARAMS from '../../public/static/js/qthParams.json'

import {parseCallsigns, urlCallsign, getStationURL, qthFieldTitles} from '../utils'
import {validCallsignFull} from '../ham-radio'
import request from '../request'
import LocalizationMixin from '../localization-mixin'

import ChangePassword from '../components/ChangePassword'

import {ACTION_EDIT_USER, ACTION_POST, ACTION_REQUEST, ACTION_LOGOUT} from '../store-user'

const CLUSTER_SETTINGS_DEFAULT = {
    "RU": "R*/* UA*/* UB*/* UC*/* UD*/* UE*/* UF*/* UG*/* UH*/* UI*/*"
}

export default {
  CURRENT_POSITION_ICONS_COUNT: CURRENT_POSITION_ICONS_COUNT,
  QTH_PARAMS: QTH_PARAMS,
  name: 'profile',
  mixins: [LocalizationMixin],
  components: {
    VueEditor, DatePicker, ChangePassword
  },
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      if (!vm.$store.getters.loggedIn) {
        vm.$router.push('/login')
      }
    })
  },
  data () {
    return {
      settings: null,
      stationFiles: {
        donateText: '',
        donateCode: '',
        stationInfo: '',
      },
      showSettings: false,
      showChangePassword: false,
      newsItem: '',
      clusterCallsigns: '',
      clusterHighlight: '',
      chatAdmins: '',
      sponsors: '',
      infoPopup: null,
      trackFile: null,
      status: {
        online: false,
        qth: {
          fields: null,
          loc: null
        }
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
    this.initSettings()
  },
  computed: {
    stationLink () {
      return getStationURL(this.settings.station.callsign)
    },
    ...mapGetters(['user', 'userStationCallsign', 'userCallsign', 'loggedIn', 'emailConfirmed']),
    qthFieldTitles () {
      return qthFieldTitles(this.settings.qthCountry)
    }
  },
  watch: {
    userStationCallsign () {
      this.loadMisc()
      this.initSettings()
    },
    clusterCallsigns () {
      this.settings.clusterCallsigns = parseCallsigns(this.clusterCallsigns)
    },
    clusterHighlight () {
      this.settings.clusterHighlight = parseCallsigns(this.clusterHighlight)
    }
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_EDIT_USER, ACTION_REQUEST, ACTION_LOGOUT]),
    initSettings () {
      const settings = this.$store.getters.user.settings
      settings.chatAccess = settings.chatAccess || 'users'
      if (this.$store.getters.userStationCallsign) {
        settings.station.callsign = this.$store.getters.userStationCallsign.toUpperCase()
      } else if (this.$store.getters.userCallsign){
        settings.station.callsign = this.$store.getters.userCallsign.toUpperCase()
      }
      const qthFields = {titles: [], values: []}
      for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
        qthFields.titles.push(QTH_PARAMS.defaultTitle)
        qthFields.values.push(null)
      }
      this.status.qth.fields = qthFields
      this.settings = settings
      this.clusterCallsigns = settings.clusterCallsigns?.length ? settings.clusterCallsigns.join(' ') : ''
      this.clusterHighlight = settings.clusterHighlight?.length ? settings.clusterHighlight.join(' ') : ''
      this.sponsors = settings.sponsors != null ? settings.sponsors.join(' ') : null
      this.chatAccess = settings.chatAccess || 'users'
      this.chatAdmins = settings.chatAdmins != null ? settings.chatAdmins.join(' ') : null
    },
    clusterFilterStationCallsign () {
      const callsign = this.settings.station.callsign
      if (callsign) {
        if (callsign.includes('/')) {
          const callsignExpr = callsign.split('/')[0] + '/*'
          if (!this.clusterHighlight.includes(callsignExpr))
            this.clusterHighlight += `${this.clusterHighlight?.length ? ' ' : ''}${callsignExpr}`
        } else {
          if (!this.clusterCallsigns.includes(callsign)) 
            this.clusterCallsigns += `${this.clusterCallsigns?.length ? ' ' : ''}${callsign}`
          if (!this.clusterHighlight.includes(callsign)) 
            this.clusterHighlight += `${this.clusterHighlight?.length ? ' ' : ''}${callsign}`
        }
      }
    },
    initClusterSettings () {
      if (this.settings.qthCountry in CLUSTER_SETTINGS_DEFAULT) {
        this.clusterCallsigns = CLUSTER_SETTINGS_DEFAULT[this.settings.qthCountry]
      }
      this.clusterFilterStationCallsign()
    },
    showSettingsClick () {
      if (this.showSettings) {
        this.showSettings = false
      } else {
        this.showChangePassword = false
        this.showSettings = true
      }
    },
    showChangePasswordClick () {
      if (this.showChangePassword) {
        this.showChangePassword = false
      } else {
        this.showSettings = false
        this.showChangePassword = true
      }
    },
    loadMisc () {
      this.loadStatus()
      this.loadTrack()
      for (const stationFile in this.stationFiles)
        (async () => {
          this.stationFiles[stationFile] = 
            (await request.get(`/${urlCallsign(this.userStationCallsign)}/${stationFile}.html`)).data
        })()
    },
    loadTrack () {
      if (this.userStationCallsign) {
        request.getJSON('track', this.userStationCallsign)
          .then(response => {
            this.trackFile = response.data.filename
          })
      }
    },
    loadStatus () {
      if (this.userStationCallsign) {
        request.getJSON('status', this.userStationCallsign)
          .then(response => {
            const data = response.data
            this.status.online = data.online
            this.status.qth.loc = data.qth ? data.qth.loc : null
            for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
              this.status.qth.fields.values[co] = data.qth.fields.values[co]
            }
          })
      }
    },
    openMap () {
      window.open('/static/html/map.html', '_blank')
    },
    logout () {
      this[ACTION_LOGOUT]()
      this.$router.push( '/login' )
    },
    async saveSettings () {
      if (this.stationFiles.stationInfo.length + this.stationFiles.donateText.length > 5024288) {
        alert(this.getString('STATION_INFO_SIZE_LIMIT'))
        return
      }
      let clearAll = false

      this.settings.station.callsign = this.settings.station.callsign.toUpperCase()

      if (this.settings.station.callsign && !validCallsignFull(this.settings.station.callsign)) {
        alert(this.getString('INVALID_STATION_CALLSIGN'))
        return
      }
      if (this.userStationCallsign !== this.settings.station.callsign) {
        if (!this.settings.station.callsign && !window.confirm(this.getString('STATION_CALLSIGN_CLEAR_WARNING')))
          return
        clearAll = true
      }
      await this[ACTION_EDIT_USER]({settings: this.settings})
      await this[ACTION_POST]({
        path: 'station/files',
        data: this.stationFiles
      })
      window.alert( 'Your settings were saved.' )
      if (clearAll) {
         this.trackFile = null
      } else {
         if (this.settings.status.get === 'manual') {
           const data = {qth: {fields: {}}}
           for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
             data.qth.fields[co] = this.status.qth.fields.values[co]
           }
           data.qth.loc = this.status.qth.loc
           data.online = this.status.online
           this[ACTION_POST]({path: 'location', data})
        }
      }
    },
    clearChat () {
      if (window.confirm( 'Do you really want to delete all chat messages?') ) {
        this[ACTION_REQUEST]({
            path: 'chat', 
            data: {station: this.userStationCallsign},
            method: 'delete'
            })
      }
    },
    clearBlog () {
      if (window.confirm( 'Do you really want to delete all blog content?') ) {
        this[ACTION_POST]({path: 'blog/clear', data: {}})
      }
    },
    clearLog () {
      if (window.confirm( 'Do you really want to delete all log entries?') ) {
        this[ACTION_POST]({path: 'log', data: {clear: 1}})
      }
    },
    clearTrack () {
      if (window.confirm( 'Do you really want to clear route?') ) {
        this[ACTION_POST]({path: 'station/track', data: {clear: 1}})
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
          path: 'station/track',
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
        this[ACTION_POST]({path: 'news', data: {station: this.userStationCallsign, clear: 1}})
      }
    },
    postNewsItem () {
      this[ACTION_POST]({
        path: 'news',
        data: {
          station: this.userStationCallsign,
          add: this.newsItem
        }
      })
        .then(() => {
          this.newsItem = ''
        })
    },
    sponsorsChange () {
      this.settings.sponsors = parseCallsigns(this.sponsors)
    },
    chatAdminsChange () {
      this.settings.chatAdmins = parseCallsigns(this.chatAdmins)
    },
    downloadLog () {
      window.open(`/aiohttp/adif/${urlCallsign(this.userCallsign)}`)
    },
    emailConfirmationRequest () {
      this[ACTION_POST]({
        path: 'confirmEmailRequest',
        data: {
          login: this.login,
        }
      })
        .then(() => {
          alert( 'Your request was accepted. Please check your email. Запрос отправлен, проверьте ваш email.' )
        })
    },

    clearAll () {
      if (window.confirm('Do you really want to reset all station settings?')) {
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
