<template>
    <div class="user" 
        :class="{'admin': user.admin, 'typing':user.typing}">
        {{$options.replace0(user.chat_callsign)}}
        <div class="icon_block">
            <user-ban-button :callsign="user.callsign"></user-ban-button>
            <user-communication-buttons
                :chat-callsign="user.chat_callsign" :callsign="user.callsign" :chat='chat'
                @chat-reply="$emit('chat-reply', user.chat_callsign)">
            </user-communication-buttons>
        </div>
    </div>
</template>

<script>

import UserCommunicationButtons from './UserCommunicationButtons'
import UserBanButton from './UserBanButton'

import {replace0} from '../utils'

export default {
  name: 'ActiveUsersEntry',
  props: ['user', 'chat'],
  components: {UserCommunicationButtons, UserBanButton},
  replace0: replace0,
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
