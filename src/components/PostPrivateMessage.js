import Vue from 'vue'

import PrivateMessageForm from "./PrivateMessageForm.vue"
import {getString} from '../localization-mixin'
import messageBox from '../message-box'

export default async function (chatCallsignTo, callsignTo, replyTo) {
  if (!window.app.$store.getters.chatCallsign) {
    return messageBox('', getString('CHAT_CALLSIGN_REQUIRED', window.app.$store.getters.language))
  }
  return new Promise((resolve) => {
    const dialog = new Vue({
      parent: window.app,
      methods: {
        closeHandler(fn, arg) {
          return function() {
            fn(arg);
            dialog.$destroy();
            dialog.$el.remove();
          };
        }
      },
      render(h) {
        return h(PrivateMessageForm, {
          props: {
            chatCallsignTo,
            callsignTo,
			replyTo
          },
          on: {
            close: this.closeHandler(resolve)
          }
        });
      }
    }).$mount();
    document.body.appendChild(dialog.$el);
  });
}
