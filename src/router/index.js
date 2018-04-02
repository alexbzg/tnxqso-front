import Vue from 'vue'
import Router from 'vue-router'
import About from './../components/About'
import Login from './../components/Login'
import Profile from './../components/Profile'
import ActiveStations from './../components/ActiveStations'
import ChangePassword from '../components/ChangePassword'

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
      path: '/about',
      name: 'About',
      component: About
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
    { path: '*',
      redirect: '/stations'
    }
  ]
})

export default router
