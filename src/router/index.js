import Vue from 'vue'
import Router from 'vue-router'
import About from './../components/About'
import Login from './../components/Login'
import Profile from './../components/Profile'
import ActiveStations from './../components/ActiveStations'
import ChangePassword from '../components/ChangePassword'
import Contact from '../components/Contact'
import Chat from '../components/Chat'
import QthNow from '../components/Qthnow'
import Tnxlog from '../components/Tnxlog'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/',
      redirect: '/stations'
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
      path: '/changePassword',
      name: 'ChangePassword',
      component: ChangePassword,
      props: true
    },
    {
      path: '/contact',
      name: 'Contact',
      component: Contact,
      props: true
    },
    { path: '*',
      redirect: '/stations'
    }
  ]
})

export default router
