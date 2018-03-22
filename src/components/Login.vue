<template>
    <div id="login_register">
        Login <span>(admin's callsign)</span><br/>
        <input type="text" id="login_input" v-model="login"/><br/>
        Password <span>(min. 8 symbols)</span><br/>
        <input type="password" id="password_input" v-model="password"/><br/>
        <input type="checkbox" id="login_remember" v-model="remember"/> Remember me<br/>
        <!--form @submit.prevent="onSubmit" v-if="newUser"-->
            <vue-recaptcha v-if="newUser"
                ref="invisibleRecaptcha"
                @verify="onVerify"
                @expired="onExpired"
                size="invisible"
                :sitekey="sitekey">
            </vue-recaptcha>
            <!--input type="submit" id="button_login" class="btn" value="Register"/-->
        <!--/form-->
        <input type="button" id="button_login" class="btn" 
            :value="newUser ? 'Register': 'Login'" @click="onSubmit"/>
        <br/><br/>
        <input type="button" id="button_register" class="btn" 
            :value="newUser ? 'Login' : 'Register new admin'"
            @click="newUser = !newUser" :class="{btn2: !newUser}"/>
        <input type="button" id="button_recovery" class="btn btn2" value="Password recovery"/>

    </div>
</template>

<script>
import _ from 'underscore'
import VueRecaptcha from 'vue-recaptcha'
import router from './../router'
export default {
  name: 'login',
  props: ['user'],
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( vm.user.loggedIn ) {
        router.push( '/profile' )
      }
    } )
  },
  data () {
    return {
      newUser: false,
      remember: false,
      login: null,
      password: null,
      sitekey: '6Ld4TywUAAAAAJRaC7z5GNrmn70QLwABtgkavjyY',
      recaptcha: null
    }
  },
  methods: {
    onSubmit: _.debounce(function (e) {
      if (this.newUser && !this.recaptcha) {
        this.$refs.invisibleRecaptcha.execute()
        return
      }
      this.doLogin()
    }, 300, true),
    doLogin () {
      this.user.login(
        { login: this.login,
          password: this.password,
          newUser: this.newUser,
          recaptcha: this.recaptcha },
        this.remember
      )
        .catch(function (error) {
          var msg = ''
          console.log(error)
          if (error.status === 400) {
            msg = error.message
          } else {
            msg = 'Login failed because of server error. Please try again later.'
          }
          alert(msg)
          this.resetRecaptcha()
        })
    },
    onVerify (response) {
      this.recaptcha = response
      this.doLogin()
    },
    onExpired () {
      this.recaptcha = null
    },
    resetRecaptcha () {
      this.$refs.invisibleRecaptcha.reset() // Direct call reset method
    }
  },
  components: { VueRecaptcha }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
