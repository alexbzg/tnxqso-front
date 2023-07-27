<template>
    <div id="post">
        <div id="messages">
          <div id="post_switch">
              <img
                  :src="'/static/images/switch_' + (pm_enabled ? 'on' : 'off') + '.png'"
                  @click="toggle_pm_enabled"/>
              {{getString(pm_enabled ? 'PERSONAL_MESSAGES_ON' : 'PERSONAL_MESSAGES_OFF')}}
          </div>

          <div id="delete_all_messages"
              @click="delete_message(null)">
              {{getString('DELETE_ALL_MESSAGES')}}
          </div>


          <div
              v-for="message in messages"
              class="message"
              :class="{unread: message.unread}"
              :key="message.id">
              <div class="from">
                  {{message.chat_callsign_from}}
                  <span class="name">{{message.name_from}}</span>
                  <span class="date_time">{{message.tstamp[0]}} {{message.tstamp[1]}}</span>
              </div>
              <img
                  v-if="pm_enabled"
                  class="replay"
                  src="/static/images/icon_reply.png"
                  :title="getString('REPLY')"
                  @click="reply(message)"/>
              <a target="_blank" rel="nofollow"
                  :href="'https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=' + message.txt">
                  <img class="translate" src="/static/images/icon_translate_circle.png"
                  title="Translate this message" />
              </a>
              <img
                  class="delete"
                  src="/static/images/icon_close.png"
                  :title="getString('DELETE_MESSAGE')"
                  @click="delete_message(message)"/>

              <div class="message_text">
                  <pre>{{message.txt}}</pre>
              </div>
          </div>
        </div>

        <div id="users_list">
          <active-users></active-users>
        </div>

    </div>
</template>

<script>

import {mapGetters, mapActions, mapMutations} from 'vuex'

import {ACTION_EDIT_USER, ACTION_DELETE_MESSAGE, ACTION_READ_MESSAGES} from '../store-user'
import {ACTION_ADD_USERS_CONSUMER, MUTATE_USERS_CONSUMER, ACTION_POST_ACTIVITY} from '../store-activity'

import LocalizationMixin from '../localization-mixin'

import ActiveUsers from '../components/ActiveUsers'
import postPrivateMessage from '../components/PostPrivateMessage'
import messageBox from '../message-box'

export default {
  name: 'Post',
  components: {ActiveUsers},
  mixins: [LocalizationMixin],
  data () {
    return {
      pm_enabled: this.$store.getters.user.pm_enabled
    }
  },
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      if (!vm.$store.getters.loggedIn) {
        vm.$router.push('/login')
      } else {
        vm.readMessages()
      }
    })
  },
  mounted () {
    this[ACTION_ADD_USERS_CONSUMER]('post')
  },
  beforeDestroy () {
    this[MUTATE_USERS_CONSUMER]({id: 'post', value: false})
  },
  methods: {
    ...mapMutations([MUTATE_USERS_CONSUMER]),
    ...mapActions([ACTION_EDIT_USER, ACTION_DELETE_MESSAGE, ACTION_READ_MESSAGES, ACTION_ADD_USERS_CONSUMER,
        ACTION_POST_ACTIVITY]),
    toggle_pm_enabled () {
      const pm_enabled = !this.pm_enabled
      this[ACTION_EDIT_USER]({pm_enabled: pm_enabled})
        .then(() => {
            this.pm_enabled = pm_enabled
            this[ACTION_POST_ACTIVITY]()
        })
    },
    readMessages () {
      const ids = this.$store.getters.unreadMessages.map(message => message.id)
      if (ids.length) {
        this[ACTION_READ_MESSAGES](ids)
      }
    },
    delete_message (message) {
      if (message === null) {
          messageBox('',
              `${this.getString('DELETE_ALL_MESSAGES')}?`,
              true)
            .then(() => {
              this[ACTION_DELETE_MESSAGE](null)
            })
      } else {
        this[ACTION_DELETE_MESSAGE](message.id)
      }
    },
    reply (message) {
      postPrivateMessage(message.chat_callsign_from, message.callsign_from, message.txt)
    }
  },
  computed: {
    ...mapGetters(['user']),
    messages () {
      return this.$store.state.user.messages
    }
  },
  watch: {
    messages: {
      handler () {
        this.readMessages()
      },
      deep: true
    },
    user () {
      this.pm_enabled = this.user.pm_enabled
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
pre {
    white-space: pre-wrap;       /* Since CSS 2.1 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
