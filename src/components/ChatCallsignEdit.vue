<template>
    <input 
        type="text" 
        id="your_call" 
        placeholder="Chat callsign"
        v-model.trim="editValue" 
        @blur="editBlur"
        />
</template>

<script>

import {mapGetters, mapActions} from 'vuex'

import {ACTION_EDIT_USER} from '../store-user'
import {ACTION_POST_ACTIVITY} from '../store-activity'


export default {
  name: "ChatCallsignEdit",
  data() {
    return {
      editValue: this.$store.getters.chatCallsign
    }
  },
  methods: {
    ...mapActions([ACTION_EDIT_USER, ACTION_POST_ACTIVITY]),
    editBlur () {
      if (this.editValue) {
        this.editValue = this.editValue.toUpperCase()
      }
      if (this.chatCallsign !== this.editValue) {
        this[ACTION_EDIT_USER]({chat_callsign: this.editValue})
            .then(() => this[ACTION_POST_ACTIVITY]())
            .finally(() => this.editValue = this.chatCallsign)
      }
    }
  },
  computed: {
    ...mapGetters(['chatCallsign'])
  }
}
</script>
