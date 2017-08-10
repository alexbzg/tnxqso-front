import Vue from 'vue'
import Router from 'vue-router'
import About from './../components/About'
import Login from './../components/Login'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
})
