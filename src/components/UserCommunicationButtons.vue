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
                :title="getString('PERSONAL_CHAT_MESSAGE')"/>
            <img v-if="pmEnabled"
                src="/static/images/icon_message_sms.png" 
                :title="getString('PERSONAL_MESSAGE')"
                @click="postPrivateMessage"/>
        </template>
    </span>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

import LocalizationMixin from '../localization-mixin'

import postPrivateMessage from './PostPrivateMessage'

export default {
  name: 'userCommunicationButtons',
  props: ['callsign', 'chatCallsign', 'chat', 'pm_enabled_fallback'],
  mixins: [LocalizationMixin],
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
    ...mapGetters(['userToken', 'user']),
    ...mapState({
      activeUsers: state => state.activity.users
    }),
    pmEnabled () {
      if (!this.user.pm_enabled) {
        return false
      }
      if (this.callsign in this.activeUsers) {
        return this.activeUsers[this.callsign].pm_enabled
      }
      return this.pm_enabled_fallback
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
