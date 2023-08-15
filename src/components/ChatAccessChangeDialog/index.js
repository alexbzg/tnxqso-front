import Vue from 'vue'

import ChatAccessChangeDialog from './ChatAccessChangeDialog'

export default async function (chatAccess) {
  return new Promise((resolve, reject) => {
    const dialog = new Vue({
      parent: window.app,
      methods: {
        closeHandler(fn, arg) {
          fn(arg)
          dialog.$destroy()
          dialog.$el.remove()
        }
      },
      render(h) {
        return h(ChatAccessChangeDialog, {
          props: {
            chatAccess
          },
          on: {
            confirm: (event) =>  this.closeHandler(resolve, event),
            cancel: () => this.closeHandler(reject, new Error('canceled'))
          }
        })
      }
    }).$mount()
    document.body.appendChild(dialog.$el)
  })
}


