<template>
    <div id="contact">
        <vue-recaptcha v-if="!loggedIn"
            ref="invisibleRecaptcha"
            @verify="onVerify"
            @expired="onExpired"
            size="invisible"
            :sitekey="sitekey">
        </vue-recaptcha>
        <template v-if="!loggedIn">
            <input type="text" id="email" v-model="email" placeholder="Your email"/><br/>
        </template>
        <textarea v-model="text" placeholder="Your message"/><br/>
        <input type="button" id="button_submit" class="btn" 
            :disabled="disableSubmit" value="Send" @click="submit"/>
    </div>
</template>
<script>
import _ from 'underscore'
import {validateEmail} from '../utils'
import router from '../router'
import VueRecaptcha from 'vue-recaptcha'
export default {
  name: 'contact',
  props: ['user'],
  components: { VueRecaptcha },
  data () {
    return {
      email: null,
      text: null,
      loggedIn: this.user.loggedIn,
      sitekey: '6Ld4TywUAAAAAJRaC7z5GNrmn70QLwABtgkavjyY',
      recaptcha: null
    }
  },
  methods: {
    submit: _.debounce(function (e) {
      if (!this.loggedIn) {
        this.$refs.invisibleRecaptcha.execute()
        return
      }
      this.send()
    }, 300, true),
    send () {
      const vm = this
      const data = { text: this.text }
      if ( !this.loggedIn ) {
        data.email = this.email
        data.recaptcha = this.recaptcha
      }
      this.user.serverPost( 'contact', data )
        .then( function () {
          vm.text = null
          alert( 'Your message was sent succefully.' )
          router.push( '/' )
          if (!vm.loggedIn) {
            vm.resetRecaptcha()
          }
        })
        .catch( function () {
          if (!vm.loggedIn) {
            vm.resetRecaptcha()
          }
        })
    },
    onVerify (response) {
      this.recaptcha = response
      this.send()
    },
    onExpired () {
      this.recaptcha = null
    },
    resetRecaptcha () {
      this.$refs.invisibleRecaptcha.reset() // Direct call reset method
      this.recaptcha = null
    }
  },
  computed: {
    disableSubmit () {
      if (!this.loggedIn && !validateEmail( this.email ) ) {
        return true
      }
      return !this.text
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
