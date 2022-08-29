<template>
    <div id="login_register">
        <vue-recaptcha v-if="newUser || passwordRecovery"
            ref="invisibleRecaptcha"
            @verify="onVerify"
            @expired="onExpired"
            size="invisible"
            :sitekey="sitekey">
        </vue-recaptcha>
        Login <span>(user callsign)</span><br/>
        <input type="text" id="login_input" v-model.trim="login"/><br/>
        <template v-if="newUser">
            E-mail<br/>
            <input type="text" id="email_input" v-model.trim="email"/><br/>
        </template>
        <template v-if="!passwordRecovery">
            Password <span>(min. 8 symbols)</span><br/>
            <input type="password" id="password_input" v-model="password"/><br/>
            <input type="checkbox" id="login_remember" v-model="remember"/> Remember me<br/>
        </template>
        <input type="button" id="button_login" class="btn"
            :class="{btn2: newUser}"
            :value="passwordRecovery ? 'Send Request' : (newUser ? 'Register': 'Login')"
            :disabled="disableSubmit"
            @click="onSubmit"/>
        <br/><br/>
        <input type="button" id="button_register" class="btn"
            v-if="!passwordRecovery"
            :value="newUser ? 'Login' : 'Register new user'"
            @click="newUser = !newUser" :class="{btn2: !newUser}"/>
        <input type="button" id="button_recovery" class="btn btn3"
            :value="!passwordRecovery ? 'Password recovery' : 'Login'"
            @click="passwordRecovery = !passwordRecovery"/>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import _ from 'underscore'
import {VueRecaptcha} from 'vue-recaptcha'

import {validateEmail, debugLog} from '../utils'
import {ACTION_LOGIN, ACTION_POST} from '../store-user'

export default {
  name: 'login',
  props: ['after'],
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if ( vm.$store.getters.loggedIn ) {
        vm.loggedInRedirect()
      }
    })
  },
  data () {
    return {
      newUser: false,
      passwordRecovery: false,
      remember: true,
      login: null,
      password: null,
      email: null,
      sitekey: '6Ld4TywUAAAAAJRaC7z5GNrmn70QLwABtgkavjyY',
      recaptcha: null
    }
  },
  methods: {
    ...mapActions([ACTION_LOGIN, ACTION_POST]),
    onSubmit: _.debounce(function () {
      if ((this.newUser || this.passwordRecovery) && !this.recaptcha) {
        this.$refs.invisibleRecaptcha.execute()
        return
      }
      if (this.passwordRecovery) {
        this.passwordRecoveryRequest()
      } else if (this.userToken) {
        this.emailConfirmationRequest()
      } else {
        this.doLogin()
      }
    }, 300, true),
    emailConfirmationRequest () {
      this[ACTION_POST]({
        path: 'confirmEmailRequest',
        data: {
          login: this.login,
          recaptcha: this.recaptcha
        }
      })
        .then(() => {
          alert( 'Your request was accepted. Please check your email.' )
          this.passwordRecovery = false
          this.resetRecaptcha()
        })
        .catch(() => {
          this.resetRecaptcha()
        })

    },
    doLogin () {
      this[ACTION_LOGIN](
        {
          data: {
            login: this.login,
            password: this.password,
            newUser: this.newUser,
            email: this.email,
            recaptcha: this.recaptcha },
          remember: this.remember
        })
        .then(() => {
          this.loggedInRedirect()
        })
        .catch(error => {
          var msg = ''
          debugLog(error)
          if (error.status === 400) {
            msg = error.message
          } else {
            msg = 'Login failed because of server error. Please try again later.'
          }
          alert(msg)
          this.resetRecaptcha()
        })
    },
    passwordRecoveryRequest () {
      this[ACTION_POST]({
        path: 'passwordRecoveryRequest',
        data: {
          login: this.login,
          recaptcha: this.recaptcha
        }
      })
        .then(() => {
          alert( 'Your request was accepted. Please check your email.' )
          this.passwordRecovery = false
          this.resetRecaptcha()
        })
        .catch(() => {
          this.resetRecaptcha()
        })
    },
    onVerify (response) {
      this.recaptcha = response
      if (this.passwordRecovery) {
        this.passwordRecoveryRequest()
      } else {
        this.doLogin()
      }
    },
    onExpired () {
      this.recaptcha = null
    },
    resetRecaptcha () {
      if ('invisibleRecaptcha' in this.$refs) {
        this.$refs.invisibleRecaptcha.reset() // Direct call reset method
      }
      this.recaptcha = null
    },
    loggedInRedirect () {
      this.$router.push(this.after || '/profile')
    }
  },
  components: { VueRecaptcha },
  computed: {
    ...mapGetters(['userToken', 'loggedIn']),
    disableSubmit () {
      return !(this.login && this.login.length > 2 &&
        (this.passwordRecovery || ( this.password && this.password.length > 7 ) ) &&
        (!this.newUser || validateEmail( this.email )))
    }
  },
  watch: {
    loggedIn () {
      if (this.loggedIn) {
        this.loggedInRedirect()
      }
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
