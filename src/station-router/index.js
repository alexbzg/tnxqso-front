import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../views/StationCluster'
import StationGallery from '../views/StationGallery'
import StationInfo from '../views/StationInfo'
import StationMap from '../views/StationMap'
import StationLog from '../views/StationLog'
import StationStats from '../views/StationStats'
import StationInstagram from '../views/StationInstagram'
import StationDonate from '../views/StationDonate'
import Chat from '../views/Chat'
import ActiveStations from './../views/ActiveStations'
import Login from './../views/Login'
import Profile from './../views/Profile'

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
      path: '/cluster',
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
      path: '/gallery',
      name: 'StationGallery',
      component: StationGallery,
      props: {serviceName: 'gallery'}
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
    {
      path: '/login',
      name: 'Login',
      component: Login,
      props: {after: '/chat'}
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      props: true
    },

    { path: '*',
      redirect: '/log'
    }
  ]
})

export default router
