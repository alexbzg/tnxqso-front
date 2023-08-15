<template>
    <Modal
        :title="getString('CHAT_ACCESS')"
        :cancel_button="true"
        @confirm='$emit("confirm", {clearChat})'
        @cancel='$emit("cancel")'>
        {{getString('CHAT_ACCESS_' + (chatAccess === 'admins' ? 'USERS' : 'ADMINS'))}}
        {{getString('CHAT_ACCESS_CHANGE')}}            
        <template v-if="chatAccess === 'users'">
            <input 
                v-if="chatAccess == 'users'"
                id="clear_chat_checkbox"
                type="checkbox"
                v-model="clearChat"/>
            {{getString('CHAT_CLEAR')}}
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
