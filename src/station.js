// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Station from './Station'
import router from './station-router'
import store from './store-station'

import capitalizeDirective from './capitalize-directive'
capitalizeDirective()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  data: {},
  template: '<Station/>',
  components: { Station }
})
