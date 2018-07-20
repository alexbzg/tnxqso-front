<template>
    <div id="chat">
    <div id="refresh_time">Auto refresh<br/><b>5 sec</b></div>
        <table id="message_form">
            <tbody>
                <tr>
                    <td>
                        <input type="text" id="your_call" v-model="chatUserField" @change="chatUserFieldChanged"/>
                    </td>
                    <td>
                        <input type="text" id="your_name" v-model="chatUserName"/>
                    </td>
                    <td>
                        <input type="text" id="message_text" v-model="messageText" @keyup="onTyping"/>
                    </td>
                    <td>
                        <button @click="buttonClick()" :disabled="!buttonVisible">OK</button>
                    </td>
            </tr>
            <tr>
                <td class="note">your callsign</td>
                <td class="note">your name</td>
                <td class="note">your message</td>
                <td class="note">&nbsp;</td>
            </tr>
        </tbody></table>
        
        <table id="chat_layout">
          <tr>
            <td>

        <table id="chat_window">
            <tr v-for="msg in data" :class="{admin: msg.admin, new_msg: msg.new}"> 
                <td class="call">
                    <span class="call" @click="replyTo(msg)">{{msg.user}}</span><br/>
                    <span class="name" @click="replyTo(msg)" v-if="msg.name">{{msg.name}}</span>
                    <a :href="'http://qrz.com/db/' + msg.user" target="_blank" rel="noopener" 
                        title="Link to QRZ.com">
                        <img src="/static/images/icon_qrz.png"/>
                    </a>
                    <br/>
                    <span class="date_time">{{msg.date}} {{msg.time}}</span>
                </td>
                <td class="message" @mouseover="msgMouseOver(true,$event)" 
                    @mouseout="msgMouseOver(false,$event)">
                    <img class="delete_btn" src="/static/images/delete.png" 
                        title="Delete this message" @click="deleteMsg( msg.ts )"/>
                    {{msg.text}}
                </td>
            </tr>
        </table>

        </td>
        <td>
       
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

        </td>
      </tr>
    </table>



    </div>
</template>

<script>
import _ from 'underscore'
import tabMixin from '../station-tab-mixin'
import activeUsersService from '../active-users-service'
import storage from '../storage'

const chatUserNameStorageKey = 'chatUserName'

const typingInt = 5 * 60
export default {
  mixins: [tabMixin],
  name: 'StationChat',
  props: ['stationSettings', 'user', 'chatUser'],
  data () {
    return {
      tabId: 'chat',
      chatUserField: this.chatUser,
      chatUserName: null,
      messageText: null,
      activeUsers: [],
      typingTs: null,
      posting: false
    }
  },
  mounted () {
    this.activeUsersInterval = setInterval( this.updateActiveUsers, 2000 )
    this.chatUserName = storage.load( chatUserNameStorageKey, 'local' )
  },
  beforeDestroy () {
    clearInterval( this.activeUsersInterval )
  },
  methods: {
    buttonClick () {
      if (this.adminCS( this.chatUserField ) &&
        this.chatUserField !== this.user.callsign ) {
        window.alert( 'You must be logged in as ' + this.chatUserField )
        return
      }
      if (this.chatUser !== this.chatUserField) {
        this.$parent.setChatUser( this.chatUserField )
      }
      if (this.messageText) {
        const vm = this
        storage.save( chatUserNameStorageKey, this.chatUserName, 'local' )
        this.serverPost( { 'from': this.chatUser,
          'text': this.messageText,
          'name': this.chatUserName } )
          .then( function () { vm.messageText = null } )
      }
    },
    serverPost (data) {
      const vm = this
      vm.posting = true
      data.station = this.stationSettings.station.callsign
      return this.user.serverPost( 'chat', data )
        .then( function () { vm.service.load() } )
        .finally( function () { vm.posting = false } )
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
          const au = []
          for ( const cs in data ) {
            data[cs].cs = cs
            au.push( data[cs] )
          }
          au.sort(
            function ( a, b ) {
              if ( a.cs < b.cs ) { return -1 }
              if ( b.cs < a.cs ) { return 1 }
              return 0
            })
          vm.$set( vm, 'activeUsers', au )
        })
    },
    adminCS (cs) {
      return cs === this.stationSettings.admin
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
    },
    replyTo (msg) {
      if ( !this.messageText || this.messageText.indexOf( msg.user + ':' ) === -1 ) {
        this.messageText = msg.user + ': ' + ( this.messageText ? this.messageText : '' )
      }
    }
  },
  computed: {
    isAdmin: function () {
      return ( this.user.callsign && this.adminCS( this.user.callsign ) ) ||
        this.user.siteAdmin
    },
    buttonVisible: function () {
      return !this.posting && Boolean( this.messageText ) && Boolean( this.chatUserField )
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
