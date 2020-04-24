<template>
    <div v-if="station.publish || siteAdmin" class="one_station">
      <table>
        <tr>
          <td class="callsign">
            <template v-if="siteAdmin">
                <input type="checkbox" v-model="station.publish.admin" @change="publishChange()"/>
                <input type="checkbox" v-model="station.publish.user" @change="publishChange()"/>
            </template>
            {{$options.replace0(station.station.callsign.toUpperCase())}}
          </td>
          <td>
            <station-status-small v-if="type == 'active'" :stationSettings="station"
                :station="station.station.callsign">
            </station-status-small>
          </td>
          <td>
            <div class="station_internal_links">
              <a :href="stationURL + '#/info'" v-if="station.enable.stationInfo">Info</a>
              <a :href="stationURL + '#/log'" v-if="station.enable.log">Log</a>
              <a :href="stationURL + '#/map'" v-if="station.enable.map">Map</a>
              <a :href="stationURL + '#/stats'" v-if="station.enable.stats">Stats</a>
              <a :href="stationURL + '#/chat'" v-if="station.enable.chat">Chat</a>
              <a :href="stationURL + '#/gallery'" v-if="station.enable.gallery">Gallery</a>
              <a :href="stationURL + '#/donate'" v-if="station.enable.donate">Support</a>
            </div>
            <div class="title">{{station.station.title}}</div>
            <div class="period" v-if="period">{{period}}</div>
          </td>
        </tr>
      </table>
<!--        <a :href="stationURL"></a>   Это так надо? -->
    </div>
</template>

<script>
import * as moment from 'moment'

import {replace0, urlCallsign} from '../utils'
import StationStatusSmall from './StationStatusSmall'

export default {
  replace0: replace0,
  name: 'ActiveStationsEntry',
  components: {StationStatusSmall},
  props: ['siteAdmin', 'station', 'type'],
  data () {
    return {
    }
  },
  computed: {
    period () {
      if (this.type !== 'archive' && this.station.station.activityPeriod &&
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
