<template>
    <div id="private_message_layout">
      <div id="private_message_form">
        <img id="btn_cancel" src="/static/images/icon_close.png" title="Cancel / Отмена" @click="$emit('close')"/>
        <div id="replay_text" v-html="replyTo"></div>
        <div id="from_to"><!--<span>from</span> {{$options.replace0(chatCallsign)}} to--><span>to</span> {{$options.replace0(chatCallsignTo)}}</div>
        <textarea v-model="messageText"></textarea><br/>
        <input type="button" id="btn_ok" value="OK" @click="post" :disabled="pending || messageText.length < 1"/>
      </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import {ACTION_POST} from '../store-user'
import {replace0} from '../utils'

export default {
  replace0: replace0,
  name: 'changePassword',
  props: ['chatCallsignTo', 'callsignTo', 'replyTo'],
  data () {
    return {
      messageText: '',
      pending: false
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    post () {
      this.pending = true
      const data = {
        callsign_from: this.userCallsign,
        chat_callsign_from: this.chatCallsign,
        name_from: this.userName,
        callsign_to: this.callsignTo,
        txt: this.messageText
      }
      this[ACTION_POST]({
        path: 'privateMessages/post',
        data: data})
        .then(() => {
          alert('Сообщение отправлено.')
          this.$emit('close')
        })
        .catch(error => {
          if (error.message == 'The recipient does not exist or is not accepting private messages.') {
            alert('Получатель отключил прием сообщений.')
            this.$emit('close')
          } else {
            throw error
          }
        })
        .finally(() => {
          this.pending = false
        })
    }
  },
  computed: {
    ...mapGetters(['userCallsign', 'chatCallsign', 'userName'])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
