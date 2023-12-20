<template>
    <div id="chat">

        <table id="message_form" v-if="hasChatAccess && !isBanned">
            <tbody>
                <tr>
                    <td>
                        <chat-callsign-edit/>
                    </td>
                    <td>
                        <input type="text" id="message_text"
                          v-model="messageText" @keyup="onTyping" ref="msgTextInput"/>
                        <img id="smile_btn" src="/static/images/smiles/01.gif"
                              @click="showSmilies = !showSmilies"/>
                        <button @click="buttonClick()" :disabled="!postButtonEnabled">OK</button>

                    </td>
                </tr>
                <tr>
                    <td>
                        <input type="text" id="your_name" placeholder="chat name"
                          v-model.trim="userNameField" @blur="userNameBlur"/>
                    </td>
                    <td
                      id="chat_control_buttons"
                        v-if="(service && service.station) && (isStationAdmin || siteAdmin)">

                        <span
                          id="admin_message"
                          v-show="isAdmin && service && service.station "
                          src="/static/images/chat_dots.png"
                          title="*** Закреплённое сообщение / *** Pinned message"
                          @click="pinMsg" >***</span>

                        <span
                          id="chat_mode"
                          :class="{chat_mode_admin: chatAccess === 'admins',
                            chat_mode_all: chatAccess === 'users'}"
                          @click="toggleChatAccess">
                            CHAT MODE: {{chatAccess === 'admins' ? 'ADMIN' : 'ALL'}}
                        </span>

                        <span
                          id="blacklist"
                          @click="editBanlist"
                          >
                          BLACKLIST
                        </span>

                    </td>
                </tr>
            </tbody>
        </table>
        <div id="div_no_login" v-if="!loggedIn">
            <router-link to="/login">Login</router-link> to post messages. &nbsp;&nbsp;
            <router-link to="/login">Залогиньтесь</router-link>, чтобы отправлять сообщения.
        </div>
        <div id="div_no_email" v-if="loggedIn && !emailConfirmed">
            Confirm your email address to post messages. &nbsp;&nbsp;
            Подтвердите ваш email, чтобы отправлять сообщения.
        </div>
        <div id="div_no_email" v-if="emailConfirmed && !hasChatAccess">
            {{getString('CHAT_ACCESS_RESTRICTED')}}
        </div>
        <div id="div_no_email" v-if="isBanned">
            {{getString('CHAT_BANNED')}}
        </div>



        <smilies v-show="showSmilies" @hide="hideSmilies" @smilie-click="insertSmilie">
        </smilies>

        <table id="chat_layout">
          <tr>
            <td>


        <table v-for="entry in data" :key="entry.id" :id="entry.id">
            <tr v-for="(msg, idx) in entry.msg" :class="{admin: msg.admin && service && service.station,
                new_msg: msg.new, sponsor: msg.sponsor && isAdmin}" :key="idx">
                <td class="call">
                    <user-ban-button
                        :callsign="msg.cs"
                        :chat-callsign="msg.user"
                        :station-admin="isAdmin ? stationAdminCallsign : null"
                        >
                    </user-ban-button>
                    <span class="call">{{$options.replace0(msg.user)}}</span>
                    <br/>
                    <span class="name">{{msg.name}}</span>
                    <br/>
                    <span class="date_time">{{msg.date}} {{msg.time}}</span>
                    <user-communication-buttons
                        :chat-callsign="msg.user"
                        :callsign="msg.cs"
                        :chat="true"
                        :pm_enabled_fallback="msg.pm_enabled"
                        @chat-reply="replyTo"
                    />
                </td>
                <td class="message">
                    <img class="delete_btn"
                        src="/static/images/delete.png"
                        v-if="isAdmin || msg.cs === userCallsign"
                        title="Delete this message"
                        @click="deleteMsg( msg.ts )"
                    />
                    <translate-link
                        :text="msg.text"
                        title="Translate this message"
                    />
                    <span class="message_to" v-for="callsign in msg.to" :key="callsign"
                        :class="{personal: callsign === chatCallsign}">
                        &rArr; {{callsign}}
                    </span>
                    <span class="message_text" v-html="msg.text"></span>
                </td>
            </tr>
        </table>

        </td>

        <td>
            <active-users :chat="true" :station="service.station"
                @chat-reply="replyTo">
            </active-users>
        </td>

      </tr>
    </table>

    </div>
</template>

<script>
import {mapActions, mapMutations, mapGetters, mapState} from 'vuex'

import _ from 'underscore'
import insertTextAtCursor from 'insert-text-at-cursor'
import showDialog from '../show-dialog'

import ServiceDisplay from './ServiceDisplay'
import Smilies from '../components/Smilies'
import UserCommunicationButtons from '../components/UserCommunicationButtons'
import UserBanButton from '../components/UserBanButton'
import ActiveUsers from '../components/ActiveUsers'
import ChatCallsignEdit from '../components/ChatCallsignEdit'
import TranslateLink from '../components/TranslateLink'
import EditStationBanlist from '../components/EditStationBanlist'

import {replace0} from '../utils'
import {parseMsgText, replyTo} from '../chat-utils'
import showChatAccessChangeDialog from '../components/ChatAccessChangeDialog/index.js'
import LocalizationMixin from '../localization-mixin'

import {ACTION_POST_ACTIVITY, MUTATE_CURRENT_ACTIVITY} from '../store-activity'
import {ACTION_REQUEST, ACTION_EDIT_USER} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {ACTION_LOAD_STATION} from '../store-station-settings'

export default {
  extends: ServiceDisplay,
  replace0: replace0,
  name: 'Chat',
  mixins: [LocalizationMixin],
  components: {Smilies, UserCommunicationButtons, UserBanButton, ActiveUsers, ChatCallsignEdit, TranslateLink},
  data () {
    return {
      showSmilies: false,
      userNameField: this.$store.getters.userName,
      messageText: '',
      typingTs: null,
      posting: false
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.storeCurrentActivity()
    })
  },
  beforeRouteLeave (to, from, next) {
    this[MUTATE_CURRENT_ACTIVITY]({chat: false, station: null})
    next()
  },
  methods: {
    ...mapActions([ACTION_REQUEST, ACTION_EDIT_USER, ACTION_UPDATE_SERVICE, ACTION_POST_ACTIVITY,
        ACTION_LOAD_STATION]),
    ...mapMutations([MUTATE_CURRENT_ACTIVITY]),
    insertSmilie (smilie) {
      insertTextAtCursor(this.$refs.msgTextInput, ':' + smilie + ':')
    },
    hideSmilies () {
      this.showSmilies = false
    },
    pinMsg () {
      if (!this.messageText.startsWith('***')) {
        this.messageText = '*** ' + this.messageText
      }
    },
    storeCurrentActivity () {
      if (this.service) {
        this[MUTATE_CURRENT_ACTIVITY]({chat: true, station: this.service.station})
        this[ACTION_POST_ACTIVITY]()
      }
    },
    userNameBlur () {
      if (this.userName !== this.userNameField) {
        this[ACTION_EDIT_USER]({name: this.userNameField})
      }
    },
    buttonClick () {
      if (!this.postButtonEnabled) {
        return
      }
      this.showSmilies = false
      this.messageText = this.messageText.trim()
      if (this.messageText) {
        this.serverPost({
          from: this.chatCallsign,
          text: this.messageText,
          name: this.userName,
          pm_enabled: this.pm_enabled
        })
          .then(() => {
            this.messageText = ''
          })
      }
    },
    serverPost (data, method, update) {
      this.posting = true
      data.station = this.service.station
      return this[ACTION_REQUEST]({path: 'chat', data, method})
        .then(() => {
            if (update)
              this[ACTION_UPDATE_SERVICE](this.serviceName)
        })
        .finally(() => {
            this.posting = false
        })
    },
    adminCS (cs) {
      return cs === this.stationSettings.admin
    },
    onTyping (event) {
      if (event.key === 'Enter') {
        this.buttonClick()
      } else {
        this.postTyping()
      }
    },
    postTyping: _.debounce( function () {
      this[ACTION_POST_ACTIVITY](true)
    }, 5000, { 'leading': true, 'trailing': false } ),
    msgMouseOver ( state, e ) {
      if (this.isAdmin) {
        if (state) {
          e.currentTarget.classList.add( 'can_delete' )
        } else {
          e.currentTarget.classList.remove( 'can_delete' )
        }
      }
    },
    deleteMsg (ts) {
      if (this.skipConfirmation.chatDelete ||
        confirm('Удалить сообщение?\nDo you really want to delete this message?')) {
        this.serverPost({ts}, 'delete', true)
      }
    },
    replyTo (callsign) {
      this.messageText = replyTo(callsign, this.messageText)
    },
    async toggleChatAccess () {
      try {
        const dialogResult = await showChatAccessChangeDialog(this.chatAccess)
        const settings = this.$store.getters.user.settings
        settings.chatAccess = settings.chatAccess === 'admins' ? 'users' : 'admins'
        await this[ACTION_EDIT_USER]({ settings })
        this[ACTION_LOAD_STATION]()
        if (settings.chatAccess === 'admins' && dialogResult.clearChat) {
            this.serverPost({keepPinned: 1}, 'delete')
        }
      } catch (error) {
        console.log(error)
      }
    },
    async editBanlist () {
      await showDialog(EditStationBanlist, {stationAdmin: this.stationAdminCallsign})
    }
  },
  watch: {
    service () {
      this.storeCurrentActivity()
    },
    userCallsign () {
      this.chatCallsignField = this.chatCallsign
      this.userNameField = this.userName
    }
  },
  computed: {
    ...mapGetters(['siteAdmin', 'loggedIn', 'userCallsign', 'chatCallsign', 'userName', 'emailConfirmed',
        'isStationAdmin', 'chatAccess', 'stationAdminCallsign', 'bannedBy']),
    ...mapState({
      skipConfirmation: state => state.user.user.settings.skipConfirmation
    }),
    isAdmin () {
      if (!this.service || !this.loggedIn) {
        return false
      }
      return this.siteAdmin || (this.service.station && this.emailConfirmed &&
        (this.$store.state.stationSettings.admin === this.userCallsign ||
            (this.$store.state.stationSettings.chatAdmins &&
            this.$store.state.stationSettings.chatAdmins.includes(this.userCallsign))))
    },
    hasChatAccess() {
      return this.loggedIn && this.emailConfirmed &&
        (!this.service || !this.service.station || !this.$store.state.stationSettings.chatAccess ||
        this.$store.state.stationSettings.chatAccess !== 'admins' ||
        (this.$store.state.stationSettings.chatAccess === 'admins' && this.isAdmin))
    },
    isBanned() {
      return this.loggedIn && this.bannedBy?.includes(this.stationAdminCallsign)
    },
    data () {
      const data = [
        {id: 'admins_window', msg: []},
        {id: 'chat_window', msg: []}
      ]
      if (this.serviceData) {
        for (const _msg of this.serviceData) {
          const msg = { ..._msg, ...parseMsgText(_msg.text) }
          if (!msg.admin && this.service && this.service.station && this.isAdmin &&
            this.$store.state.stationSettings.sponsors &&
            this.$store.state.stationSettings.sponsors.includes(msg.user)) {
            msg.sponsor = true
          }
          if (msg.text.startsWith('***') && msg.admin && this.service && this.service.station) {
            msg.text = msg.text.replace(/^\*+\s+/, '')
            data[0].msg.push(msg)
          } else {
            data[1].msg.push(msg)
          }
        }
      }
      if (data[0].msg.length == 0) {
        data.shift()
      }
      return data
    },
    postButtonEnabled: function () {
      return !this.posting && Boolean(this.messageText) && (this.chatCallsign.length > 2)
    }
  }
}
</script>

<style scoped>
</style>
