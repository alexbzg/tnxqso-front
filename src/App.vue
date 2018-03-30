<template>
    <div id="app">
        <table class="tabs index_tabs">
<!--            <tr>
                <td colspan="2" id="logo">
                    <img src="/static/images/tnxqso_logo.png" border="0" title="tnxqso.com">
                </td>        
            </tr>  -->
            <tr>
                <td>
                    <router-link to="/stations" tag="div" id="tab_stations" class="tab">
                        Stations
                    </router-link>
<!--                    <router-link to="/about" tag="div" id="tab_about" class="tab">
                        Help
                    </router-link> -->
                </td>
                <td id="login">
                   <router-link to="/login" tag="div" id="tab_login" class="tab" v-if="!loggedIn">
                        For administrators
                    </router-link>
                    <router-link to="/profile" tag="div" id="tab_login" class="tab" v-else>
                        Profile
                    </router-link>
                    <router-link to="/contacts" tag="div" id="tab_contacts" class="tab">
                        Contacts
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
      user: user,
      loggedIn: user.loggedIn
    }
  },
  computed: {
/*  loggedIn: function () {
      return this.user.loggedIn
    } */
  }
}
</script>

<style>
</style>
