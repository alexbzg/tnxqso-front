<template>
    <span class="icon_block">
        <a 
            :href="'http://qrz.com/db/' + callsign" 
            target="_blank" rel="noopener"
            title="Link to QRZ.com"
            >
            <img src="/static/images/icon_qrz.png" title="QRZ.com link"/>
        </a>
        <a 
            :href="'http://qrz.ru/db/' + callsign" 
            target="_blank" 
            rel="noopener"
            title="Link to QRZ.ru">
            <img src="/static/images/icon_qrz_ru.png" title="QRZ.ru link"/>
        </a>
        <template v-if="userToken">
            <img 
                v-if="chat"
                @click="$emit('chat-reply', chatCallsign)" 
                src="/static/images/icon_message.png" 
                title="Personal message to the chat / Персональное сообщение в чат"/>
            <img 
                src="/static/images/icon_message_sms.png" 
                title="Personal message / Персональное сообщение"
                @click="postPrivateMessage"/>
        </template>
    </span>
</template>

<script>
import {mapGetters} from 'vuex'

import postPrivateMessage from './PostPrivateMessage'

export default {
  name: 'userCommunicationButtons',
  props: ['callsign', 'chatCallsign', 'chat'],
  data () {
    return {
    }
  },
  methods: {
    postPrivateMessage() {
      postPrivateMessage(this, this.chatCallsign, this.callsign)
    }
  }, 
  computed: {
    ...mapGetters(['userToken'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
