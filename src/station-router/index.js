import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../components/StationCluster'
// import StationNews from '../components/StationNews'
import StationInfo from '../components/StationInfo'
import StationMap from '../components/StationMap'
import StationLog from '../components/StationLog'
import StationStats from '../components/StationStats'
import StationInstagram from '../components/StationInstagram'
import StationDonate from '../components/StationDonate'
import Chat from '../components/Chat'
import ActiveStations from './../components/ActiveStations'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/log'
    },
    {
      path: '/stations',
      name: 'Stations',
      component: ActiveStations,
      props: true
    },
    {
      path: '/adxcluster',
      name: 'StationCluster',
      props: true,
      component: StationCluster
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat,
      props: {serviceName: 'chat'}
    },
    {
      path: '/talks',
      name: 'Talks',
      component: Chat,
      props: {serviceName: 'talks'}
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
