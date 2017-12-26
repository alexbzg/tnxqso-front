<template>
    <div id="chat">
        <table id="message_form">
            <tbody>
                <tr>
                    <td>
                        <input type="text" id="your_call" v-model="chatUserField">
                    </td>
                    <td>
                        <input type="text" id="message_text" v-model="messageText">
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
                <!-- ngRepeat: user in vm.users()| filter: {'tab': 'chat'} -->
            </div>
            <div class="chat_info_title">Other pages</div>
            <div class="chat_info_users2">
                <!-- ngRepeat: user in vm.users() | filter: {'tab': '!chat'} <span ng-repeat="user in vm.users() | filter: {'tab': '!chat'}" class="ng-binding ng-scope">R7CL<br></span><!-- end ngRepeat: user in vm.users() | filter: {'tab': '!chat'} <span ng-repeat="user in vm.users() | filter: {'tab': '!chat'}" class="ng-binding ng-scope">TEST<br></span><!-- end ngRepeat: user in vm.users() | filter: {'tab': '!chat'} -->
            </div>

        </div>
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
import user from '../user'
import storage from '../storage'
const chatUserStorageKey = 'chatUser'
export default {
  mixins: [tabMixin],
  name: 'StationChat',
  data () {
    const chatUser = storage.load( chatUserStorageKey, 'local' ) || user.callsign
    return {
      stationSettings: this.$parent.stationSettings,
      tabId: 'chat',
      chatUser: chatUser,
      chatUserField: chatUser,
      messageText: null,
      data: {}
    }
  },
  methods: {
    buttonClick () {
      if (this.chatUserField !== this.chatUser) {
        this.chatUser = this.chatUserField
        storage.save( chatUserStorageKey, this.chatUser, 'local' )
      }
      if (this.messageText) {
        const vm = this
        user.serverPost( 'chat',
          { 'from': this.chatUser,
            'text': this.messageText,
            'station': this.stationSettings.station.callsign
          } )
        .then( function () { vm.messageText = null } )
      }
    }
  },
  computed: {
    isAdmin: function () {
      return user.callsign && this.stationSettings.chatAdmins.find( user.callsign )
    },
    buttonVisible: function () {
      return (this.chatUserField && this.chatUserField !== this.chatUser) ||
        (this.chatUserField && this.messageText)
    },
    buttonCaption: function () {
      return this.messageText ? 'Post message' : 'Change callsign'
    }

  }
}
</script>

<style scoped>
</style>
