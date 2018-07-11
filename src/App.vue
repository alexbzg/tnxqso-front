<template>
    <div id="app">
        <a href="/"><img id="logo_index" src="/static/images/tnxqso_logo.png" border="0" title="TNXQSO.com"></a>
        <table class="tabs index_tabs">
            <tr>
                <td>
                    <router-link to="/stations" tag="div" id="tab_stations" class="tab">
                        Stations
                    </router-link>
                </td>
                <td id="login">
                    <router-link to="/about" tag="div" id="tab_about" class="tab">
                        About
                    </router-link>
                    <router-link to="/login" tag="div" id="tab_login" class="tab" v-if="!loggedIn">
                        For administrators
                    </router-link>
                    <router-link to="/profile" tag="div" id="tab_login" class="tab" v-else>
                        Profile
                    </router-link>
                    <router-link to="/contact" tag="div" id="tab_contacts" class="tab">
                        Contact
                    </router-link>
                </td>
            </tr>
        </table>
        <div class="list index_list">
            <router-view :user="user"></router-view>
        </div>
    </div>
</template>

<script>
import user from './user'
import './style.css'
export default {
  name: 'app',
  data () {
    return {
      user: user
//      loggedIn: user.loggedIn
    }
  },
  computed: {
    loggedIn: function () {
      return this.user.loggedIn
    }
  }
}
</script>

<style>
</style>
