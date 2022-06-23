import Vue from 'vue'
import Router from 'vue-router'
import About from './../views/About'
import Login from './../views/Login'
import Profile from './../views/Profile'
import ActiveStations from './../views/ActiveStations'
import Contact from '../views/Contact'
import Chat from '../views/Chat'
import QthNow from '../views/Qthnow'
import Tnxlog from '../views/Tnxlog'
import Tnxpost from '../views/Tnxpost'
import QthNowMap from '../views/QthNowMap'
import ChangePasswordView from '../views/ChangePassword'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/stations'
    },
    {
      path: '/qthnowmap',
      name: 'QthNowMap',
      component: QthNowMap,
      props: false
    },
    {
      path: '/qthnowsecret',
      name: 'QthNowMap',
      component: QthNowMap,
      props: {secret: true}
    },
    {
      path: '/stations',
      name: 'Stations',
      component: ActiveStations,
      props: true
    },
    {
      path: '/talks',
      name: 'Talks',
      component: Chat,
      props: {serviceName: 'talks'}
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/qthnow',
      name: 'QthNow',
      component: QthNow
    },
    {
      path: '/tnxlog',
      name: 'Tnxlog',
      component: Tnxlog
    },
    {
      path: '/tnxpost',
      name: 'Tnxlog',
      component: Tnxpost
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      props: true
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      props: true
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact,
      props: true
    },
    {
      path: '/changePassword',
      name: 'ChangePassword',
      component: ChangePasswordView,
      props: true
    },
    { path: '*',
      redirect: '/stations'
    }
  ]
})

export default router
