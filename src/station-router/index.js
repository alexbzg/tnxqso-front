import Vue from 'vue'
import Router from 'vue-router'

import StationCluster from '../views/StationCluster'
import StationBlog from '../views/StationBlog'
import StationInfo from '../views/StationInfo'
import StationMap from '../views/StationMap'
import StationLog from '../views/StationLog'
import StationStats from '../views/StationStats'
import StationDonate from '../views/StationDonate'
import Chat from '../views/Chat'
import ActiveStations from './../views/ActiveStations'
import Login from './../views/Login'
import Profile from './../views/Profile'
import Post from '../views/Post'
import request from '../request'
import {STATION_TABS} from '../constants'

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
      name: 'cluster',
      props: true,
      component: StationCluster
    },
    {
      path: '/chat',
      name: 'chat',
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
      name: 'stats',
      component: StationStats,
      props: true
    },
    {
      path: '/post',
      name: 'Post',
      component: Post,
      props: false
    },
    {
      path: '/blog',
      name: 'blog',
      component: StationBlog,
      props: {serviceName: 'blog'}
    },
    {
      path: '/log',
      name: 'log',
      component: StationLog,
      props: true
    },
    {
      path: '/info',
      name: 'stationInfo',
      component: StationInfo,
      props: true
    },
    {
      path: '/map',
      name: 'map',
      component: StationMap,
      props: true
    },
    {
      path: '/donate',
      name: 'donate',
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

const pathSegs = location.pathname.split('/')
while (pathSegs.slice(-1).pop() === "")
    pathSegs.pop()
router.STATION_DIR = pathSegs.slice(-1).pop()

router.afterEach((to) => {
  if (STATION_TABS.includes(to.name)) {
    const payload = {station: router.STATION_DIR, tab: to.name}
    if (router.app.$store.getters.userToken) {
        payload['token'] = router.app.$store.getters.userToken
    } else {
        payload['user_id'] = router.app.$store.getters.user.id
    }
    request.perform('visitors', payload)
  }
})

export default router
