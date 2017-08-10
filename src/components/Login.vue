<template>
    <div id="login_register">
        Login <span>(admin's callsign)</span><br/>
        <input type="text" id="login_input" v-model="login"/><br/>
        Password <span>(min. 8 symbols)</span><br/>
        <input type="password" id="password_input" v-model="password"/><br/>
        <input type="checkbox" id="login_remember" v-model="remember"/> Remember me<br/>
        <form @submit.prevent="onSubmit" v-if="newUser">
            <vue-recaptcha
                ref="invisibleRecaptcha"
                @verify="onVerify"
                @expired="onExpired"
                size="invisible"
                :sitekey="sitekey">
            </vue-recaptcha>
            <input type="submit" id="button_login" class="btn" value="Register"/>
        </form>
        <input type="button" id="button_login" class="btn" value="Login" @click="onSubmit" v-else/>
        <br/><br/>
        <input type="button" id="button_register" class="btn" value="Register new user"
            @click="newUser = !newUser" v-bind:class="{btn2: !newUser}"/>
        <input type="button" id="button_recovery" class="btn btn2" value="Password recovery"/>

    </div>
</template>

<script>
import _ from 'underscore'
import axios from 'axios'
import VueRecaptcha from 'vue-recaptcha'
export default {
  name: 'login',
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
      if (this.newUser) {
        this.$refs.invisibleRecaptcha.execute()
        if (!this.recaptcha) {
          return
        }
      }
      axios.post('/uswgi/login',
        { login: this.login,
          password: this.password,
          newUser: this.newUser,
          recaptcha: this.recaptcha })
        .then(function (response) {
          console.log(response.data)
          console.log(response.status)
          console.log(response.statusText)
          console.log(response.headers)
          console.log(response.config)
        })
        .catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request)
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message)
          }
          console.log(error.config)
        })
    }, 300, true),
    onVerify: function (response) {
      this.recaptcha = response
    },
    onExpired: function () {
      this.recaptcha = null
    },
    resetRecaptcha () {
      this.$refs.recaptcha.reset() // Direct call reset method
    }
  },
  components: { VueRecaptcha }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
