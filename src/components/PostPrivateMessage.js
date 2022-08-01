import Vue from 'vue'

import {debugLog} from '../utils'
debugLog(Vue.$store)
import PrivateMessageForm from "./PrivateMessageForm.vue"

export default async function (chatCallsignTo, callsignTo, replyTo) {
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
