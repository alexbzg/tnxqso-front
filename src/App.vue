<template>
    <div id="app">
        <a href="/"><img id="logo_index" src="/static/images/tnxqso_logo.png" border="0" title="TNXQSO.com"></a>
        <language-switch></language-switch>
        <table class="tabs index_tabs">
            <tr>
                <td>
                    <router-link to="/stations" tag="div" id="tab_stations" class="tab"
                        :class="{updated_tab: !$store.state.activeStations.read}">
                        Stations
                    </router-link>
                    <router-link to="/talks" tag="div" id="tab_talks" class="tab"
                        :class="{updated_tab: $store.state.services.talks.new}">
                        Talks
                    </router-link>
                </td>
                <td id="login">
                    <router-link to="/about" tag="div" id="tab_about" class="tab">
                        About
                    </router-link>
                    <router-link to="/qthnow" tag="div" id="tab_qthnow" class="tab">
                        QTHnow
                    </router-link>
                    <router-link to="/tnxpost" tag="div" id="tab_tnxpost" class="tab">
                        TNXpost
                    </router-link>
                    <router-link to="/tnxlog" tag="div" id="tab_tnxlog" class="tab">
                        TNXLOG
                    </router-link>
                    <router-link to="/contact" tag="div" id="tab_contacts" class="tab">
                        Contact
                    </router-link>
                    <router-link to="/login" tag="div" id="tab_login" class="tab" v-if="!loggedIn">
                        For administrators
                    </router-link>
                    <router-link to="/profile" tag="div" id="tab_login" class="tab" v-else>
                        Profile
                    </router-link>
                </td>
            </tr>
        </table>
        <div class="list index_list">
            <donate-block></donate-block>
            <keep-alive include="activeStations">
                <router-view></router-view>
            </keep-alive>
        </div>
    </div>
</template>

<script>
// import user from './user'
// user.switchDataServiceUrlPrefix( true )
import './style.css'

import LanguageSwitch from './components/LanguageSwitch'
import DonateBlock from './components/DonateBlock.vue'

export default {
  name: 'app',
  components: {LanguageSwitch, DonateBlock},
  data () {
    return {
//      user: user
//      loggedIn: user.loggedIn
    }
  },
  computed: {
    loggedIn: function () {
      return this.$store.getters.loggedIn
    }
  }
}
</script>

<style>
</style>
