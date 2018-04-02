import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../components/StationCluster'
import StationNews from '../components/StationNews'
import StationInfo from '../components/StationInfo'
import StationMap from '../components/StationMap'
import StationChat from '../components/StationChat'
import StationLog from '../components/StationLog'
import StationInstagram from '../components/StationInstagram'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/log'
    },
    {
      path: '/adxcluster',
      name: 'StationCluster',
      component: StationCluster
    },
    {
      path: '/news',
      name: 'StationNews',
      component: StationNews,
      props: true
    },
    {
      path: '/log',
      name: 'StationLog',
      component: StationLog
    },
    {
      path: '/info',
      name: 'StationInfo',
      component: StationInfo
    },
    {
      path: '/map',
      name: 'StationMap',
      component: StationMap,
      props: true
    },
    {
      path: '/chat',
      name: 'StationChat',
      component: StationChat,
      props: true
    },
    {
      path: '/instagram',
      name: 'StationInstagram',
      component: StationInstagram,
      props: true
    },
    { path: '*',
      redirect: '/log'
    }
  ]
})

export default router
