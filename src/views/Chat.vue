<template>
    <div id="chat">

    <div id="personal_chat_message" v-if="instantMessage">
      <img id="close_personal_message" src="/static/images/icon_close.png" width="20"
        title="Close this personal message" @click="closeInstantMessage">
      <img src="/static/images/icon_secret.png" />
      <div id="from_to">
          from <span id="from">{{instantMessage.user}}</span> to <span id="to">{{chatUser}}</span><br/>
          <span id="date_time">{{instantMessage.date}} {{instantMessage.time}}</span>
      </div>
      <div id="text" v-html="instantMessageText"></div>
    </div>

        <table id="message_form" v-if="chatAccess">
            <tbody>
                <tr>
                    <td>
                        <input type="text" id="your_call" placeholder="Chat callsign"
                          v-model="chatCallsignField" @blur="chatCallsignBlur"/>
                        <input type="text" id="your_name" placeholder="Chat name"
                          v-model="userNameField" @blur="userNameBlur"/>
                        <img id="admin_message"
                            v-show="isAdmin && service && service.station "
                            src="/static/images/icon_admin_message.png"
                            title="*** Закреплённое сообщение / *** Pinned message"
                            @click="pinMsg">
                        <input type="text" id="message_text"
                          v-model="messageText" @keyup="onTyping" ref="msgTextInput"/>
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
                new_msg: msg.new}" :key="idx">
                <td class="call">
                    <span class="call" @click="replyTo(msg.user)">{{$options.replace0(msg.user)}}</span><br/>
                    <span class="name" @click="replyTo(msg.user)" v-if="msg.name">{{msg.name}}</span>
                    <br/>
                    <span class="date_time">{{msg.date}} {{msg.time}}</span>
                    <span class="icon_block">
                      <a :href="'http://qrz.com/db/' + msg.user" target="_blank" rel="noopener"
                        title="Link to QRZ.com"><img src="/static/images/icon_qrz.png" title="QRZ.com link"/></a>
                      <a :href="'http://qrz.ru/db/' + msg.user" target="_blank" rel="noopener"
                        title="Link to QRZ.ru"><img src="/static/images/icon_qrz_ru.png" title="QRZ.ru link"/></a>
                      <img  @click="replyTo(msg.user)" src="/static/images/icon_message.png" title="Personal message to chat / Персональное сообщение в чат"/>
<!--
<img class="icon_ban" src="/static/images/icon_message_private.png" title="Private message outside the chat / Персональное сообщение вне чата"/>
-->
                      <img class="icon_ban" src="/static/images/icon_ban.png" title="Заблокировать пользователя"
                        v-if="siteAdmin" @click="banQuery(msg.cs)"/>
                    </span>
                </td>
                <td class="message">
                    <img class="delete_btn" src="/static/images/delete.png" v-if="isAdmin"
                        title="Delete this message" @click="deleteMsg( msg.ts )"/>
                    <a target="_blank" rel="nofollow" class="translate_lnk"
                        :href="'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=' +
                        plainText(msg.text)">
                        <img class="translate_btn" src="/static/images/icon_translate.png"
                        title="Translate this message" />
                    </a>
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

        <div id="chat_info">
            <div class="chat_info_title">This page: {{activeUsers['thisPage'].length}}</div>
            <div class="chat_info_users1">
                <span v-for="(user, idx) in activeUsers['thisPage']"
                    :class="{'admin': user.admin, 'typing':user.typing}" :key="idx">
                    {{$options.replace0(user.cs)}}<br/>
                </span>
            </div>

            <template v-if="'talks' in activeUsers">
                <div class="chat_info_title">Talks: {{activeUsers['talks'].length}}</div>
                <div class="chat_info_users2">
                    <span v-for="(user, idx) in activeUsers['talks']"
                        :class="{'admin': user.admin, 'typing':user.typing}" :key="idx">
                        {{$options.replace0(user.cs)}}<br/>
                    </span>
                </div>
            </template>

            <div class="chat_info_title">Other pages: {{activeUsers['other'].length}}</div>
            <div class="chat_info_users2">
                <span v-for="(user, idx) in activeUsers['other']"
                    :class="{'admin': user.admin}" :key="idx">
                    {{$options.replace0(user.cs)}}<br/>
                </span>
            </div>
        </div>

        </td>
      </tr>
    </table>



    </div>
</template>

<script>
import {mapActions, mapMutations, mapGetters, mapState} from 'vuex'

import _ from 'underscore'
import sanitizeHTML from 'sanitize-html'
import insertTextAtCursor from 'insert-text-at-cursor'

import ServiceDisplay from './ServiceDisplay'
import Smilies, {SMILIES_IMG_PATH} from '../components/Smilies'

import {replace0} from '../utils'
import messageBox from '../message-box'

import {ACTION_POST_ACTIVITY, MUTATE_CURRENT_ACTIVITY, MUTATE_USERS_CONSUMER, ACTION_ADD_USERS_CONSUMER}
  from '../store-activity'
import {ACTION_POST, ACTION_EDIT_USER, MUTATE_INSTANT_MESSAGE} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'

const typingInt = 5 * 60
const RE_MSG_TO = /(:?\u21d2\s?\w+(:?\/\w+)*\s?)+(:?\s|$)/

const MSG_SANITIZE_HTML_SETTINGS = {
  allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'image'],
  allowedAttributes: {
    image: ['src']
  }
}

function transformText (text) {
  return sanitizeHTML(text, MSG_SANITIZE_HTML_SETTINGS)
    .replace(/:(\d\d):/g, '<image src="' + SMILIES_IMG_PATH + '$1.gif"/>')
}

export default {
  extends: ServiceDisplay,
  replace0: replace0,
  name: 'Chat',
  components: {Smilies},
  data () {
    return {
      showSmilies: false,
      chatCallsignField: this.$store.getters.chatCallsign,
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
    ...mapMutations([MUTATE_CURRENT_ACTIVITY, MUTATE_USERS_CONSUMER, MUTATE_INSTANT_MESSAGE]),
    insertSmilie (smilie) {
      insertTextAtCursor(this.$refs.msgTextInput, ':' + smilie + ':')
    },
    closeInstantMessage () {
      this[MUTATE_INSTANT_MESSAGE](null)
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
    plainText (html) {
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
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
          from: this.chatCallsignField,
          text: this.messageText,
          name: this.userName
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
      const txt = String.fromCharCode(8658) + ' ' + callsign
      if ( !this.messageText || this.messageText.indexOf(txt) === -1 ) {
        this.messageText = txt + ' ' + (this.messageText ? this.messageText : '')
      }
    },
    banQuery (callsign) {
      this[ACTION_POST]({
        path: 'banUser',
        data: {
          user: callsign,
          query: true
        }
      })
        .then(rsp => {
          const data = rsp.data
          let alt = ''
          if (data.alts.length) {
            alt = `<br/>cвязанные логины: ${data.alts.join(', ')}`
          }
          messageBox(
            'Заблокировать пользователя?',
            `логин: ${data.login}<br/> email: ${data.email}${alt}`,
            true)
            .then(() => {
              this[ACTION_POST]({
                path: 'banUser',
                data: {
                  user: callsign
                }
              })
                .then(alert('Пользователь заблокирован.'))
            })
        })
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
    ...mapGetters(['siteAdmin', 'loggedIn', 'userCallsign', 'chatCallsign', 'userName', 'instantMessage', 'emailConfirmed']),
    ...mapState({
      chatUser: state => state.user.chatUser,
      chatUserName: state => state.user.chatUserName,
      skipConfirmation: state => state.user.user.settings.skipConfirmation
    }),
    isAdmin () {
      if (!this.service || !this.loggedIn) {
        return false
      }
      return this.siteAdmin || (this.service.station && this.emailConfirmed &&
        this.$store.state.stationSettings.admin === this.userCallsign)
    },
    chatAccess() {
      return this.loggedIn && this.emailConfirmed &&
        (!this.service || !this.service.station || !this.$store.state.stationSettings.chatAccess ||
        this.$store.state.stationSettings.chatAccess !== 'admins' ||
        (this.$store.state.stationSettings.chatAccess === 'admins' && this.isAdmin))
    },
    instantMessageText () {
      return this.instantMessage ? transformText(this.instantMessage.text) : null
    },
    data () {
      const data = [
        {id: 'admins_window', msg: []},
        {id: 'chat_window', msg: []}
      ]
      if (this.serviceData) {
        for (const _msg of this.serviceData) {
          const msg = {..._msg}
          msg.text = transformText(msg.text)
          let match = RE_MSG_TO.exec(msg.text)
          if (match) {
            const to = match[0]
            msg.text = msg.text.replace(to, '')
            msg.to = to.split(/\s?\u21d2\s?/)
            msg.to.shift()
            msg.to = msg.to.map(item => item.trim())
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
    activeUsers () {
      const au = {
        'thisPage': [],
        'other': []
      }
      if (!this.service) {
        return au
      }
      if (this.service.station) {
        au['talks'] = []
      }
      const stationSettings = this.service.station ? this.$store.state.stationSettings : null
      const data = this.$store.state.activity.users
      const ts = Date.now() / 1000
      for (const cs in data) {
        const u = JSON.parse(JSON.stringify(data[cs]))
        if (u.typing && ts - u.ts > typingInt) {
          u.typing = false
        }
        u.cs = cs
        if (this.service.station) {
          u.admin = u.cs === stationSettings.admin || stationSettings.chatAdmins.includes(cs)
        } else {
          u.admin = false
        }
        if (u.chat && ((u.station && u.station === this.service.station) ||
          (!u.station && !this.service.station))) {
          au['thisPage'].push(u)
        } else if (!u.station && u.chat) {
          au['talks'].push(u)
        } else {
          au['other'].push(u)
        }
      }
      for (const type in au) {
        au[type].sort(
            function ( a, b ) {
              if ( a.cs < b.cs ) { return -1 }
              if ( b.cs < a.cs ) { return 1 }
              return 0
            })
      }
      return au
    },
    postButtonEnabled: function () {
      return !this.posting && Boolean(this.messageText) && Boolean(this.chatCallsignField)
    }
  }
}
</script>

<style scoped>
</style>
