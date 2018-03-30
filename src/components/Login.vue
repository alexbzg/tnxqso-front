<template>
    <div id="login_register">
      <div id="register_text">
        <b>Только для администраторов экспедиций/станций!</b><br/>Для обычного пользования сервисами TNXQSO.com <u>регистрация не нужна</u>.<br/>Регистрация и этот раздел предназначены для организации трансляции online-журнала<br/>и управления информационными службами своей экспедиции/станции.<br/><br/><b>For administrators of the expeditions/stations only!</b><br/>For usual use of the TNXQSO.com services <u>registration isn't necessary</u>.<br/>Registration and this section are intended for the online-log's organization<br/>and for management of information services of own dxpedition/station.
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
        <template v-if="!passwordRecovery">
            Password <span>(min. 8 symbols)</span><br/>
            <input type="password" id="password_input" v-model="password"/><br/>
            <input type="checkbox" id="login_remember" v-model="remember"/> Remember me<br/>
        </template>
        <input type="button" id="button_login" class="btn" 
            :class="{btn2: newUser}"
            :value="passwordRecovery ? 'Send Request' : (newUser ? 'Register': 'Login')" 
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
      passwordRecovery: false,
      remember: false,
      login: null,
      password: null,
      sitekey: '6Ld4TywUAAAAAJRaC7z5GNrmn70QLwABtgkavjyY',
      recaptcha: null
    }
  },
  methods: {
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
      const vm = this
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
          vm.resetRecaptcha()
        })
    },
    passwordRecoveryRequest () {
      const vm = this
      this.user.serverPost( 'passwordRecoveryRequest',
        { login: this.login,
          recaptcha: this.recaptcha } )
        .then( function () {
          alert( 'Your request was accepted. Please check your email.' )
        })
        .catch( function () {
          vm.resetRecaptcha()
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
      this.$refs.invisibleRecaptcha.reset() // Direct call reset method
      this.recaptcha = null
    }
  },
  components: { VueRecaptcha }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
