<template>
    <div id="chat">
        <table id="message_form">
            <tbody>
                <tr>
                    <td>
                        <input type="text" id="your_call" v-model="chatUserField" @change="chatUserFieldChanged">
                    </td>
                    <td>
                        <input type="text" id="message_text" v-model="messageText" @keyup="onTyping">
                    </td>
                    <td>
                        <button @click="buttonClick()" v-if="buttonVisible">{{buttonCaption}}</button>
                    </td>
            </tr>
            <tr>
                <td class="note">your callsign</td>
                <td class="note">your message</td>
                <td class="note">&nbsp;</td>
            </tr>
        </tbody></table>
        <div id="chat_info">
            <div class="chat_info_title">Chat page</div>
            <div class="chat_info_users1">
                <span v-for="(user, cs) in activeUsers" v-if="user.chat"
                    :class="{'admin': user.admin, 'typing':user.typing}">
                    {{cs}}
                </span>
            </div>
            <div class="chat_info_title">Other pages</div>
            <div class="chat_info_users2">
                <span v-for="(user, cs) in activeUsers" v-if="!user.chat"
                    :class="{'admin': user.admin, 'typing':user.typing}">
                    {{cs}}
                </span>
            </div>

        </div>
        <table id="chat_window">
            <tr v-for="msg in service.data" :class="{admin: msg.admin}"> 
                <td class="call">
                    <span class="call">{{msg.user}}</span><br/>
                    <span class="date_time">{{msg.date}} {{msg.time}}</span>
                </td>
                <td class="message">
                    {{msg.text}}
                </td>
            </tr>
        </table>
       
    </div>
</template>

<script>
import _ from 'underscore'
import tabMixin from '../station-tab-mixin'
import activeUsersService from '../active-users-service'
const typingInt = 5 * 60 * 1000
export default {
  mixins: [tabMixin],
  name: 'StationChat',
  props: ['stationSettings', 'user', 'chatUser'],
  data () {
    return {
      tabId: 'chat',
      chatUserField: this.chatUser,
      messageText: null,
      activeUsers: {},
      typingTs: null
    }
  },
  mounted () {
    this.activeUsersInterval = setInterval( this.updateActiveUsers, 1000 )
  },
  beforeDestroy () {
    clearInterval( this.activeUsersInterval )
  },
  methods: {
    buttonClick () {
      if (this.adminCS( this.userField ) &&
        this.chatUserField !== this.user.callsign ) {
        window.alert( 'You must be logged in as ' + this.chatUserField )
        return
      }
      if (this.chatUserField !== this.chatUser) {
        this.$parent.setChatUser( this.chatUserField )
      }
      if (this.messageText) {
        const vm = this
        this.user.serverPost( 'chat',
          { 'from': this.chatUser,
            'text': this.messageText,
            'station': this.stationSettings.station.callsign
          } )
        .then( function () {
          vm.messageText = null
          vm.service.load()
        } )
      }
    },
    updateActiveUsers () {
      const vm = this
      activeUsersService.load()
        .then( function () {
          const ts = Date.now() / 1000
          const data = activeUsersService.data
          for (const cs in data) {
            if ( data[cs].typing && ts - data[cs].ts > typingInt ) {
              data[cs].typing = false
            }
          }
          vm.activeUsers = data
        })
    },
    adminCS (cs) {
      return cs === this.stationSettings.admin ||
        this.stationSettings.chatAdmins.indexOf( cs ) !== -1
    },
    chatUserFieldChanged () {
      if (this.chatUserField && this.chatUserField !== this.chatUserField.toUpperCase()) {
        this.chatUserField = this.chatUserField.toUpperCase()
      }
    },
    onTyping: _.debounce( function () {
      this.$parent.postUserActivity( true )
    }, 5000, { 'leading': true, 'trailing': false } )
  },
  computed: {
    isAdmin: function () {
      return this.user.callsign && this.adminCS( this.user.callsign )
    },
    buttonVisible: function () {
      return (this.chatUserField && this.chatUserField !== this.chatUser) ||
        (this.chatUserField && this.messageText)
    },
    buttonCaption: function () {
      return this.messageText ? 'Post message' : 'Change callsign'
    }
  },
  watch: {
    activeUsers: {
      handler: function () {},
      deep: true
    }
  }

}
</script>

<style scoped>
</style>
