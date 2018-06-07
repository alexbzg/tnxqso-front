<template>
    <div id="chat">
    <div id="refresh_time">Auto refresh<br/><b>5 sec</b></div>
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
                <span v-for="user in activeUsers" v-if="user.chat"
                    :class="{'admin': user.admin, 'typing':user.typing}">
                    {{user.cs}}<br/>
                </span>
            </div>
            <div class="chat_info_title">Other pages</div>
            <div class="chat_info_users2">
                <span v-for="user in activeUsers" v-if="!user.chat"
                    :class="{'admin': user.admin, 'typing':user.typing}">
                    {{user.cs}}<br/>
                </span>
            </div>

        </div>
        <table id="chat_window">
            <tr v-for="msg in data" :class="{admin: msg.admin, new_msg: msg.new}"> 
                <td class="call">
                    <span class="call">{{msg.user}}</span><br/>
                    <span class="date_time">{{msg.date}} {{msg.time}}</span>
                </td>
                <td class="message" @mouseover="msgMouseOver(true,$event)" 
                    @mouseout="msgMouseOver(false,$event)">
                    {{msg.text}}
                    <img class="delete_btn" src="/static/images/delete.png" 
                        title="Delete this message" @click="deleteMsg( msg.ts )"/>
                </td>
            </tr>
        </table>
       
    </div>
</template>

<script>
import _ from 'underscore'
import tabMixin from '../station-tab-mixin'
import activeUsersService from '../active-users-service'
const typingInt = 5 * 60
export default {
  mixins: [tabMixin],
  name: 'StationChat',
  props: ['stationSettings', 'user', 'chatUser'],
  data () {
    return {
      tabId: 'chat',
      chatUserField: this.chatUser,
      messageText: null,
      activeUsers: [],
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
        this.serverPost( { 'from': this.chatUser,
          'text': this.messageText } )
          .then( function () { vm.messageText = null } )
      }
    },
    serverPost (data) {
      const vm = this
      data.station = this.stationSettings.station.callsign
      return this.user.serverPost( 'chat', data )
        .then( function () { vm.service.load() } )
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
          vm.activeUsers = []
          for ( const cs in data ) {
            data[cs].cs = cs
            vm.activeUsers.push( data[cs] )
          }
          vm.activeUsers = vm.activeUsers.sort(
            function ( a, b ) {
              if ( a.cs < b.cs ) { return -1 }
              if ( b.cs > b.cs ) { return 1 }
              return 0
            })
        })
    },
    adminCS (cs) {
      return cs === this.stationSettings.admin ||
        this.stationSettings.chatAdmins.indexOf( cs ) !== -1
    },
    chatUserFieldChanged () {
      if (this.chatUserField && this.chatUserField !== this.chatUserField.toUpperCase().trim()) {
        this.chatUserField = this.chatUserField.toUpperCase().trim()
      }
    },
    onTyping: _.debounce( function () {
      this.$parent.postUserActivity( true )
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
      if (window.confirm('Do you really want to delete this message?')) {
        this.serverPost( { 'delete': ts } )
      }
    }
  },
  computed: {
    isAdmin: function () {
      return ( this.user.callsign && this.adminCS( this.user.callsign ) ) ||
        this.user.siteAdmin
    },
    buttonVisible: function () {
      return (this.chatUserField && this.chatUserField !== '') &&
        (this.chatUserField !== this.chatUser || this.messageText)
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
