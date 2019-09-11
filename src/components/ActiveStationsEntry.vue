<template>
    <div v-if="station.publish || siteAdmin">
        <template v-if="siteAdmin">
            <input type="checkbox" v-model="station.publish.admin" @change="publishChange()"/>
            <input type="checkbox" v-model="station.publish.user" @change="publishChange()"/>
        </template>
        <span class="callsign">{{$options.replace0(station.station.callsign.toUpperCase())}}</span>
        <span class="station_internal_links">
            <a :href="stationURL + '#/info'" v-if="station.enable.stationInfo">Info</a>
            <a :href="stationURL + '#/log'" v-if="station.enable.log">Log</a>
            <a :href="stationURL + '#/map'" v-if="station.enable.map">Map</a>
            <a :href="stationURL + '#/chat'" v-if="station.enable.chat">Chat</a>
            <a :href="stationURL + '#/stats'" v-if="station.enable.stats">Stats</a>
            <a :href="'https://www.instagram.com/' + station.instagramID"
                v-if="station.enable.instagram && station.instagramID"
                target="_blank" rel="noopener">Instagram</a>
            <a :href="stationURL + '#/donate'" v-if="station.enable.donate">Support</a>
        </span><span class="period" v-if="period">{{period}}</span><br/>
        <span class="title">{{station.station.title}}</span>
        <a :href="stationURL"></a>
    </div>
</template>

<script>
import * as moment from 'moment'

import {replace0, urlCallsign} from '../utils'

export default {
  replace0: replace0,
  name: 'activeStations',
  props: ['siteAdmin', 'station', 'hidePeriod'],
  data () {
    return {
    }
  },
  computed: {
    period () {
      if (!this.hidePeriod && this.station.station.activityPeriod &&
        this.station.station.activityPeriod.length) {
        if (this.station.station.activityPeriod.length < 2) {
          return this.formatDate(this.station.station.activityPeriod[0])
        } else {
          const fdt = this.station.station.activityPeriod.map(item => this.formatDate(item))
          if (fdt[0] === fdt[1]) {
            return fdt[0]
          } else {
            return fdt[0] + ' \u2014 ' + fdt[1]
          }
        }
      }
      return ''
    },
    stationURL () {
      return '/' + urlCallsign(this.station.station.callsign)
    }
  },
  methods: {
    publishChange (station) {
      this.$emit( 'publish-change' )
    },
    formatDate (dt) {
      return moment(dt).format( 'DD MMM YYYY' ).toLowerCase()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
