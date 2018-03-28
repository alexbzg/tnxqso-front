import Vue from 'vue'
import Router from 'vue-router'
import About from './../components/About'
import Login from './../components/Login'
import Profile from './../components/Profile'

Vue.use(Router)

const router = new Router({
  routes: [
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
    }
  ]
})

router.replace({ path: '/stations', redirect: '/' })

export default router
