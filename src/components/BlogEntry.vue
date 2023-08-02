<template>
    <Modal
        @close="$emit('close')"
    >
        <template v-slot:header>
          <button
            type="button"
            class="btn-like"
            @click="toggleLike"
          >
            <img :src="'/static/images/icon_like' + likeSuffix + '.png'"/>
          </button>
          <span 
            :class="['like' + likeSuffix]"
            v-if="entry.reactions > 0"
          >
          {{entry.reactions}}
          </span>
          <span class="navigation">
            <button
              v-if="navigationControls && navigationControls[0]"
              type="button"
              class="btn-left"
              @click="$emit('navigate', -1)"
            ><img src="/static/images/icon_left.png"/>
            </button>
            21 Jul 2023 13:42
            <button
              v-if="navigationControls && navigationControls[1]"
              type="button"
              class="btn-right"
              @click="$emit('navigate', 1)"
            ><img src="/static/images/icon_right.png"/>
            </button>
          </span>
          <translate-link
            v-if="entry.txt"
            :text="entry.txt"
            title="Translate this post"
          />
        </template>

        <template v-slot:body>
            <template v-if="entry.file_type">
                <img :src="stationPath + entry.file" v-if="entry.file_type === 'image'"/>
                <video v-else controls :src="stationPath + entry.file"/>
            </template>
            <div class="caption">{{entry.txt}}</div>

            <h4>{{getString('COMMENTS')}}</h4>
            <div
                v-if="emailConfirmed"
                class="add_comment"
                >
                <chat-callsign-edit/>
                <input type="text"
                    id="comment_text"
                    :placeholder="getString('COMMENT')"
                    @keyup.enter="postCommentButtonEnabled && postComment()"
                    v-model="commentText"
                />
                <button @click="postComment()" :disabled="!postCommentButtonEnabled">OK</button>
            </div>
            <table class="comments">
                <tr
                    v-for="(comment, idx) in comments"
                    :key="idx"
                    :class="{admin: isChatAdmin(comment.user)}"
                    >
                    <td class="user">
                        <user-ban-button :callsign="comment.user"></user-ban-button>
                        <span class="call">{{replace0(comment.chat_callsign || comment.user)}}</span>
                        <br/>
                        <span class="date_time">{{comment.comment_datetime}}</span>
                        <user-communication-buttons
                            :chat-callsign="comment.chat_callsign"
                            :callsign="comment.user"
                            :pm_enabled_fallback="comment.pm_enabled"
                            :chat="true"
                            @chat-reply="replyTo"
                        />
                    </td>
                    <td class="message">
                        <img class="delete_btn" src="/static/images/delete.png" v-if="canDelete(comment)"
                            title="Delete this message" @click="deleteComment(comment)"/>
                        <translate-link
                            :text="comment.text"
                            title="Translate this comment"
                            />
                        <span class="message_to" v-for="callsign in comment.to" :key="callsign"
                            :class="{personal: callsign === chatCallsign}">
                            &rArr; {{callsign}}
                        </span>
                        <span class="message_text" v-html="comment.text"></span>
                    </td>
                </tr>
            </table>


        </template>
    </Modal>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import {stationPath, isAdmin} from '../store-station'
import {ACTION_REQUEST} from '../store-user'
import request from '../request'
import {replace0} from '../utils'

import LocalizationMixin from '../localization-mixin'

import Modal from './Modal'
import UserCommunicationButtons from './UserCommunicationButtons'
import UserBanButton from './UserBanButton'
import TranslateLink from './TranslateLink'
import ChatCallsignEdit from './ChatCallsignEdit'

import {parseMsgText, replyTo} from '../chat-utils'

export default {
  mixins: [LocalizationMixin],
  components: {Modal, UserCommunicationButtons, UserBanButton, TranslateLink, ChatCallsignEdit},
  props: ['entry', 'navigationControls'],
  name: 'BlogEntry',
  data () {
    return {
      pending: false,
      comments: [],
      commentText: '',
      like: false
    }
  },
  mounted () {
    this.getComments()
    this.getLike()
  },
  methods: {
    replace0,
    ...mapActions([ACTION_REQUEST]),
    getComments () {
      request.get(`/aiohttp/blog/${this.entry.id}/comments`)
        .then( response => {
          this.comments = response.data.map( msg => {
            return ({ ...msg, ...parseMsgText(msg.txt) })
          })
          if (this.comments) 
            this.$emit("commentsRead", this.comments[this.comments.length - 1].id)
        })
        .catch((error) => {
          if (error.status === 404)
            this.comments = []
        })
    },
    getLike () {
      if (this.emailConfirmed)
        this.apiRequest({
          path: `blog/${this.entry.id}/reactions/0`,
          data: {},
          suppressAlert: true
        })
          .then(() => { this.like = true })
          .catch((error) => {
            if (error.status === 404)
              this.like = false
          })
    },
    apiRequest (params) {
      this.pending = true
      return this[ACTION_REQUEST](params)
        .finally(() => {
          this.pending = false
        })
    },
    postComment () {
      this.apiRequest({
        path: `blog/${this.entry.id}/comments`,
        data: {text: this.commentText}
        })
        .then( () => {
          this.commentText = ''
          this.getComments()
        })
    },
    canDelete (comment) {
      return isAdmin() || this.userCallsign === comment.user
    }, 
    replyTo (callsign) {
      this.commentText = replyTo(callsign, this.commentText)
    },
    deleteComment (comment) {
      if (confirm('Удалить комментарий?\nDo you really want to delete this comment?')) {
        this.apiRequest({
          path: `blog/comments/${comment.id}`,
          data: {},
          method: 'delete'
        })
          .then( () => {
            this.getComments()
          })
      }
    },
    toggleLike () {
      if (this.emailConfirmed)
        this.apiRequest({
          path: `blog/${this.entry.id}/reactions`,
          data: {type: 0},
          method: this.like ? 'delete' : 'put'
        })
          .then(() => { 
            this.like = !this.like 
            this.$emit('reaction', this.like ? 1 : -1)
          })
    }

  },
  computed: {
    ...mapGetters(['userCallsign', 'chatCallsign', 'isChatAdmin', 'emailConfirmed']),
    stationPath,
    isAdmin,
    postCommentButtonEnabled () {
      return !this.pending && this.commentText
    },
    likeSuffix () {
      return this.like ? '_red' : ''
    }
  },
  watch: {
    entry () {
      this.comments = []
      this.commentText = ''
      this.getComments()
      this.getLike()
    }
  }
}
</script>


