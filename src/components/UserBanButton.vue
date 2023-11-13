<template>
    <img
        class="icon_ban"
        src="/static/images/icon_ban.png"
        :title="'Ban? / Заблокировать ' + userDisplay + '?'"
        v-if="siteAdmin || stationAdmin"
        @click="siteAdmin ? siteBan() : stationBan()"/>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
import {ACTION_POST} from '../store-user'
import messageBox from '../message-box'

export default {
  name: 'userCommunicationButtons',
  props: ['callsign', 'chatCallsign', 'stationAdmin'],
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    siteBan () {
      this[ACTION_POST]({
        path: 'banUser',
        data: {
          user: this.callsign,
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
                  user: this.callsign
                }
              })
                .then(alert('Пользователь заблокирован.'))
            })
        })
      },
    stationBan() {
      messageBox(
        `<br/>Заблокировать ${this.userDisplay} в этом чате?<br/><br/>`,
        ``,
        true)
        .then(() => {
           this[ACTION_POST]({
              path: 'station/banlist',
              data: {
                stationAdmin: this.stationAdmin,
                banned: this.callsign
              }
            })
            .then(alert('Пользователь заблокирован.'))
        })
    }
  },
  computed: {
    ...mapGetters(['siteAdmin']),
    userDisplay() {
      return this.siteAdmin ? this.callsign : (this.chatCallsign ?? this.callsign)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
