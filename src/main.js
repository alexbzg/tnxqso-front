// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store-index'

import capitalizeDirective from './capitalize-directive'
capitalizeDirective()

/* eslint-disable no-new */
const APP = new Vue({
  el: '#app',
  router,
  store,
  data: {},
  template: '<App/>',
  components: { App }
})

window.app = APP
