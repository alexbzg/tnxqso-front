import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../components/StationCluster'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/adxcluster',
      name: 'StationCluster',
      component: StationCluster
    }
  ]
})
