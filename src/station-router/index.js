import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../components/StationCluster'
import StationNews from '../components/StationNews'
import StationInfo from '../components/StationInfo'
import StationMap from '../components/StationMap'
import StationChat from '../components/StationChat'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/adxcluster',
      name: 'StationCluster',
      component: StationCluster
    },
    {
      path: '/news',
      name: 'StationNews',
      component: StationNews
    },
    {
      path: '/info',
      name: 'StationInfo',
      component: StationInfo
    },
    {
      path: '/map',
      name: 'StationMap',
      component: StationMap
    },
    {
      path: '/chat',
      name: 'StationChat',
      component: StationChat,
      props: true
    }

  ]
})