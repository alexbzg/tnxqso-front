<template>
    <div id="change_password">
        <template v-if="loggedIn">
            Email <br/>
            <input type="text" id="email" v-model="email"/><br/>
        </template>
        Password <span>(min. 8 symbols)</span><br/>
        <input type="password" id="password_input" v-model="password"/><br/>
        <input type="button" id="button_submit" class="btn" 
            value="Save" @click="submit"/>
        <input type="button" id="button_cancel" class="btn" v-if="loggedIn"
            value="Cancel" @click="cancel"/>

    </div>
</template>

<script>
import _ from 'underscore'
import router from './../router'
export default {
  name: 'changePassword',
  props: ['user'],
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( !vm.loggedIn && !vm.token ) {
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
      const data = {}
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
          vm.user.email = vm.email
          if (vm.loggedIn) {
            router.push( '/profile' )
          } else {
            router.push( '/login' )
          }
        })
    }),
    cancel () {
      router.push( '/profile' )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
