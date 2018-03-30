<template>
    <div id="change_password">
        <template v-if="loggedIn">
            Email <br/>
            <input type="text" id="email" v-model="email"/><br/>
        </template>
        Password <span>(min. 8 symbols)</span><br/>
        <input type="password" id="password_input" v-model="password"/><br/>
        <input type="button" id="button_submit" class="btn" 
            :value="Save" @click="submit"/>
    </div>
</template>

<script>
import _ from 'underscore'
import VueRecaptcha from 'vue-recaptcha'
import router from './../router'
export default {
  name: 'changePassword',
  props: ['user'],
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( !vm.user.loggedIn && vm.token ) {
        router.push( '/login' )
      }
    } )
  },
  data () {
    return {
      email: this.user.email,
      password: null,
      loggedIn: this.user.loggedIn,
      token: this.$route.query.token
    }
  },
  methods: {
    submit: _.debounce(function (e) {
      const vm = this
      data = {}
      if ( this.loggedIn ) {
        data.email = this.email
        if (this.password) {
          data.password = this.password
        }
      } else {
        data.token = this.token
        data.password = this.password
      }
      this.user.serverPost( 'userSettings', data )
        .then( function () {
          if (vm.loggedIn) {
            router.push( '/profile' )
          } else {
            router.push( '/login' )
          }
        })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
