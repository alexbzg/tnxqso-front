import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../components/StationCluster'
// import StationNews from '../components/StationNews'
import StationInfo from '../components/StationInfo'
import StationMap from '../components/StationMap'
import StationChat from '../components/StationChat'
import StationLog from '../components/StationLog'
import StationStats from '../components/StationStats'
import StationInstagram from '../components/StationInstagram'
import StationDonate from '../components/StationDonate'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/log'
    },
    {
      path: '/adxcluster',
      name: 'StationCluster',
      props: true,
      component: StationCluster
    },
    {
      path: '/stats',
      name: 'StationStats',
      component: StationStats,
      props: true
    },
    {
      path: '/log',
      name: 'StationLog',
      component: StationLog,
      props: true
    },
    {
      path: '/info',
      name: 'StationInfo',
      component: StationInfo,
      props: true
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
    {
      path: '/donate',
      name: 'StationDonate',
      component: StationDonate,
      props: true
    },
    { path: '*',
      redirect: '/log'
    }
  ]
})

export default router
