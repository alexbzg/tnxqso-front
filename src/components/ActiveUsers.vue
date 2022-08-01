<template>
    <div id="list_users">
        <template v-for="usersType in ['thisPage', 'talks', 'other']">
            <template v-if="users[usersType]">
                <div 
                    class="list_users_title" 
                    :key="usersType + 'Title'">
                    {{$options.titles[usersType]}}: {{users[usersType].length}}
                </div>
                <div 
                    class="list_users"
                    :class="{list_users_here: usersType === 'thisPage', list_users_other: usersType !== 'thisPage'}"
                    :key="usersType + 'List'">
                    <div
                        v-for="user, idx in users[usersType]"
                        class="user" 
                        :class="{'admin': user.admin, 'typing':user.typing}"
                        :key="idx">
                        {{$options.replace0(user.chat_callsign)}}
                        <div class="icon_block">
                            <user-ban-button :callsign="user.callsign"></user-ban-button>
                            <user-communication-buttons
                                :chat-callsign="user.chat_callsign" :callsign="user.callsign" :chat='chat'
                                @chat-reply="$emit('chat-reply', user.chat_callsign)">
                            </user-communication-buttons>
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<script>
import UserCommunicationButtons from './UserCommunicationButtons'
import UserBanButton from './UserBanButton'

import {replace0} from '../utils'


const TYPING_INT = 5 * 60

export default {
  name: 'ActiveUsers',
  props: ['chat', 'station'],
  replace0: replace0,
  titles: {
    thisPage: 'This page',
    talks: 'Talks',
    other: 'Other pages'
  },
  components: {UserCommunicationButtons, UserBanButton},
  data () {
    return {
    }
  },
  computed: {
    users () {
      const au = {
        'other': []
      }
      if (this.chat) {
        au['thisPage'] = []
        if (this.station) {
          au['talks'] = []
        }
      } else {
        au['talks'] = []
      }
      const stationSettings = this.station ? this.$store.state.stationSettings : null
      const data = this.$store.state.activity.users
      const ts = Date.now() / 1000
      for (const cs in data) {
        const u = JSON.parse(JSON.stringify(data[cs]))
        if (u.typing && ts - u.ts > TYPING_INT) {
          u.typing = false
        }
        u.cs = cs
        if (stationSettings) {
          u.admin = u.cs === stationSettings.admin || stationSettings.chatAdmins.includes(u.chat_callsign)
        } else {
          u.admin = false
        }
        if (u.chat && this.chat && ((u.station && u.station === this.station) ||
          (!u.station && !this.station))) {
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
              if ( a.chat_callsign < b.chat_callsign ) { return -1 }
              if ( b.chat_callsign < a.chat_callsign ) { return 1 }
              return 0
            })
      }
      return au
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
