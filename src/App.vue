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
                    <router-link to="/qthnowmap" tag="div" id="tab_qthnowmap" class="tab">
                        Map
                    </router-link>
                    <router-link to="/talks" tag="div" id="tab_talks" class="tab"
                        :class="{updated_tab: $store.state.services.talks.new}">
                        Talks
                    </router-link>
                    <router-link to="/login" tag="div" id="tab_login" class="tab" v-if="!loggedIn">
                        Login
                    </router-link>
                    <router-link to="/profile" tag="div" id="tab_login" class="tab" v-else>
                        Profile
                    </router-link>
                    <router-link to="/post" tag="div" id="tab_post" class="tab tab_envelope" v-if="loggedIn">
                        <img :src="'/static/images/icon_envelope' + (unreadMessages.length ? '_flash' : '') + '.gif'" />
                    </router-link>
                    <router-link to="/users" tag="div" id="tab_users" class="tab" v-if="siteAdmin">
                        Users
                    </router-link>
                </td>
                <td id="website_links">
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
                </td>
            </tr>
        </table>
        <div class="list index_list">
            <donate-block></donate-block>
            <keep-alive include="activeStations,QthNowMap">
                <router-view></router-view>
            </keep-alive>
        </div>
    </div>
</template>

<script>
// import user from './user'
// user.switchDataServiceUrlPrefix( true )
import {mapGetters} from 'vuex'

import './style.css'
import capitalizeDirective from './capitalize-directive'
capitalizeDirective()

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
    ...mapGetters(['loggedIn', 'unreadMessages', 'siteAdmin'])
  }
}
</script>

<style>
</style>
