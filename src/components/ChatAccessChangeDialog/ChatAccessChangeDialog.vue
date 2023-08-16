<template>
    <Modal
        :title="getString('CHAT_ACCESS')"
        :cancel_button="true"
        @confirm='$emit("confirm", {clearChat})'
        @cancel='$emit("cancel")'>
        <span id="change_chat_mode">{{getString('CHAT_ACCESS_' + (chatAccess === 'admins' ? 'USERS' : 'ADMINS'))}}<br/>
        {{getString('CHAT_ACCESS_CHANGE')}}</span>
        <b>{{getString('CHAT_ACCESS_SWITCH')}}</b><br/>
        <template v-if="chatAccess === 'users'">
            <span id="modal_clear_log">
              <input
                  v-if="chatAccess == 'users'"
                  id="clear_chat_checkbox"
                  type="checkbox"
                  v-model="clearChat"/>
              {{getString('CHAT_CLEAR')}}
            </span>
        </template>
    </Modal>
</template>

<script>
import LocalizationMixin from '../../localization-mixin'

import Modal from "../../message-box/Modal"

export default {
  mixins: [LocalizationMixin],
  components: {Modal},
  props: ["chatAccess"],
  name: "ChatAccessChangeDialog",
  data () {
    return {
      clearChat: false
    }
  }
}


</script>
