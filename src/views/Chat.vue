<template>
    <div id="chat">

        <table id="message_form" v-if="chatAccess">
            <tbody>
                <tr>
                    <td>
                        <chat-callsign-edit/><br/>
                        <input type="text" id="your_name" placeholder="Chat name"
                          v-model="userNameField" @blur="userNameBlur"/>
                    </td>
                    <td>
                        <img id="admin_message" class="admin_button"
                            v-show="isAdmin && service && service.station "
                            src="/static/images/icon_admin_message.png"
                            title="*** Закреплённое сообщение / *** Pinned message"
                            @click="pinMsg">
                        <input type="text" id="message_text"
                          v-model.trim="messageText" @keyup="onTyping" ref="msgTextInput"/>
                        <img id="smile_btn" src="/static/images/smiles/01.gif"
                              @click="showSmilies = !showSmilies"/>
                        <button @click="buttonClick()" :disabled="!postButtonEnabled">OK</button>
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


        <smilies v-show="showSmilies" @hide="hideSmilies" @smilie-click="insertSmilie">
        </smilies>

        <table id="chat_layout">
          <tr>
            <td>


        <table v-for="entry in data" :key="entry.id" :id="entry.id">
            <tr v-for="(msg, idx) in entry.msg" :class="{admin: msg.admin && service && service.station,
                new_msg: msg.new, sponsor: msg.sponsor && isAdmin}" :key="idx">
                <td class="call">
                    <user-ban-button :callsign="msg.cs"></user-ban-button>
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
                    <img class="delete_btn" src="/static/images/delete.png" v-if="isAdmin"
                        title="Delete this message" @click="deleteMsg( msg.ts )"/>
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

import ServiceDisplay from './ServiceDisplay'
import Smilies from '../components/Smilies'
import UserCommunicationButtons from '../components/UserCommunicationButtons'
import UserBanButton from '../components/UserBanButton'
import ActiveUsers from '../components/ActiveUsers'
import ChatCallsignEdit from '../components/ChatCallsignEdit'
import TranslateLink from '../components/TranslateLink'

import {replace0} from '../utils'
import {parseMsgText, replyTo} from '../chat-utils'

import {ACTION_POST_ACTIVITY, MUTATE_CURRENT_ACTIVITY, MUTATE_USERS_CONSUMER, ACTION_ADD_USERS_CONSUMER}
  from '../store-activity'
import {ACTION_POST, ACTION_EDIT_USER} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'

export default {
  extends: ServiceDisplay,
  replace0: replace0,
  name: 'Chat',
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
  mounted () {
    this[ACTION_ADD_USERS_CONSUMER](this.serviceName)
  },
  beforeDestroy () {
    this[MUTATE_USERS_CONSUMER]({id: this.serviceName, value: false})
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.storeCurrentActivity()
      vm.markServiceRead()
    })
  },
  beforeRouteLeave (to, from, next) {
    this[MUTATE_CURRENT_ACTIVITY]({chat: false, station: null})
    next()
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_EDIT_USER, ACTION_ADD_USERS_CONSUMER, ACTION_UPDATE_SERVICE, ACTION_POST_ACTIVITY]),
    ...mapMutations([MUTATE_CURRENT_ACTIVITY, MUTATE_USERS_CONSUMER]),
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
    chatCallsignBlur () {
      if (this.chatCallsignField) {
        this.chatCallsignField = this.chatCallsignField.toUpperCase().trim()
      }
      if (this.chatCallsign !== this.chatCallsignField) {
        this[ACTION_EDIT_USER]({chat_callsign: this.chatCallsignField})
        this[ACTION_POST_ACTIVITY]()
      }
    },
    userNameBlur () {
      if (this.userNameField) {
        this.userNameField = this.userNameField.trim()
      }
      if (this.userName !== this.userNameField) {
        this[ACTION_EDIT_USER]({name: this.userNameField})
      }
    },
    buttonClick () {
      if (!this.postButtonEnabled) {
        return
      }
      this.showSmilies = false
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
    serverPost (data) {
      this.posting = true
      data.station = this.service.station
      return this[ACTION_POST]({path: 'chat', data: data})
        .then(() => {
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
        this.serverPost( { 'delete': ts } )
      }
    },
    replyTo (callsign) {
      this.messageText = replyTo(callsign, this.messageText)
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
    ...mapGetters(['siteAdmin', 'loggedIn', 'userCallsign', 'chatCallsign', 'userName', 'emailConfirmed']),
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
    chatAccess() {
      return this.loggedIn && this.emailConfirmed &&
        (!this.service || !this.service.station || !this.$store.state.stationSettings.chatAccess ||
        this.$store.state.stationSettings.chatAccess !== 'admins' ||
        (this.$store.state.stationSettings.chatAccess === 'admins' && this.isAdmin))
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
