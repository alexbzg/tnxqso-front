<template>
    <div id="login_register">
      <div id="register_text">
        For usual use of the TNXQSO.com services <u>registration isn't necessary</u>.<br/>Registration and this section are intended for the online-log's organization<br/>and for management of information services of own dxpedition/station.<br/><b>For administrators of the expeditions/stations only!</b><br/><br/>Для обычного пользования сервисами TNXQSO.com <u>регистрация не нужна</u>.<br/>Регистрация и этот раздел предназначены для организации трансляции online-журнала<br/>и управления информационными службами своей экспедиции/станции.<br/><b>Только для администраторов экспедиций/станций!</b>
      </div>
        <vue-recaptcha v-if="newUser || passwordRecovery"
            ref="invisibleRecaptcha"
            @verify="onVerify"
            @expired="onExpired"
            size="invisible"
            :sitekey="sitekey">
        </vue-recaptcha>
        Login <span>(admin's callsign)</span><br/>
        <input type="text" id="login_input" v-model="login"/><br/>
        <template v-if="newUser">
            E-mail<br/>
            <input type="text" id="email_input" v-model="email"/><br/>
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
            :value="newUser ? 'Login' : 'Register new admin'"
            @click="newUser = !newUser" :class="{btn2: !newUser}"/>
        <input type="button" id="button_recovery" class="btn btn3" 
            :value="!passwordRecovery ? 'Password recovery' : 'Login'"
            @click="passwordRecovery = !passwordRecovery"/>

    </div>
</template>

<script>
import {mapActions} from 'vuex'

import _ from 'underscore'
import VueRecaptcha from 'vue-recaptcha'

import router from '../router'
import {validateEmail, debugLog} from '../utils'
import {ACTION_LOGIN, ACTION_POST} from '../store-user'

export default {
  name: 'login',
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      if ( vm.$store.getters.loggedIn ) {
        router.push( '/profile' )
      }
    } )
  },
  data () {
    return {
      newUser: false,
      passwordRecovery: false,
      remember: false,
      login: null,
      password: null,
      email: null,
      sitekey: '6Ld4TywUAAAAAJRaC7z5GNrmn70QLwABtgkavjyY',
      recaptcha: null
    }
  },
  methods: {
    ...mapActions([ACTION_LOGIN, ACTION_POST]),
    onSubmit: _.debounce(function (e) {
      if ((this.newUser || this.passwordRecovery) && !this.recaptcha) {
        this.$refs.invisibleRecaptcha.execute()
        return
      }
      if (this.passwordRecovery) {
        this.passwordRecoveryRequest()
      } else {
        this.doLogin()
      }
    }, 300, true),
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
          this.$router.push( '/profile' )
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
    }
  },
  components: { VueRecaptcha },
  computed: {
    disableSubmit () {
      return !(this.login && this.login.length > 2 &&
        (this.passwordRecovery || ( this.password && this.password.length > 7 ) ) &&
        (!this.newUser || validateEmail( this.email )))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
