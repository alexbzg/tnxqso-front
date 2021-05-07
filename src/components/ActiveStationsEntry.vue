<template>
    <div v-if="station.publish || siteAdmin" class="one_station" 
        :class="{compact: compactView, offline: !online}">
        <span class="callsign">
            <template v-if="siteAdmin">
                <input type="checkbox" v-model="station.publish.admin" @change="publishChange()"/>
                <input type="checkbox" v-model="station.publish.user" @change="publishChange()"/>
            </template>
            <component :is="compactView ? 'a' : 'span'" :href="stationURL + '#/info'">
                {{stationDisplayCallsign}}
            </component>
        </span>

        <station-status-small v-if="type === 'active' || compactView" :stationSettings="station"
            :station="station.station.callsign" @update-status="updateStatus"
            :compactView="compactView" :stationURL="stationURL"
            @update:online="$emit('update:online', station.station.callsign, $event)">
            <template v-if="compactView" v-slot:footer>
                <span class="links">
                    <a :href="stationURL + '#/log'" v-if="station.enable.log">LOG</a>
                    <a :href="stationURL + '#/map'" v-if="station.enable.map">MAP</a>
                    <a :href="stationURL + '#/chat'" v-if="station.enable.chat">CHAT</a>
                </span>
            </template>
        </station-status-small>

        <span class="station_full_info" v-if="!compactView">
            <div class="links">
                <a :href="stationURL + '#/info'" v-if="station.enable.stationInfo">Info</a>
                <a :href="stationURL + '#/log'" v-if="station.enable.log">Log</a>
                <a :href="stationURL + '#/map'" v-if="station.enable.map">Map</a>
                <a :href="stationURL + '#/adxcluster'" v-if="station.enable.cluster">Cluster</a>
                <a :href="stationURL + '#/stats'" v-if="station.enable.stats">Stats</a>
                <a :href="stationURL + '#/chat'" v-if="station.enable.chat">Chat</a>
                <a :href="stationURL + '#/gallery'" v-if="station.enable.gallery">Gallery</a>
                <a :href="stationURL + '#/donate'" v-if="station.enable.donate">Donate</a>
            </div>
            <div class="title">{{station.station.title}}</div>
            <div class="period" v-if="period">{{period}}</div>
        </span>

    </div>
</template>

<script>
import * as moment from 'moment'
import {mapMutations} from 'vuex'

import {replace0, urlCallsign, formatPeriod} from '../utils'
import StationStatusSmall from './StationStatusSmall'
import {MUTATE_ACTIVE_STATIONS_READ} from '../store-active-stations'

export default {
  name: 'ActiveStationsEntry',
  components: {StationStatusSmall},
  props: ['siteAdmin', 'station', 'type', 'compactView', 'online'],
  data () {
    return {
    }
  },
  activated () {
    this[MUTATE_ACTIVE_STATIONS_READ](true)
  },
  computed: {
    period () {
      if (this.type !== 'archive' && this.station.station.activityPeriod &&
        this.station.station.activityPeriod.length) {
        if (this.station.station.activityPeriod.length < 2) {
          return this.formatDate(this.station.station.activityPeriod[0])
        } else {
          return formatPeriod(this.station.station.activityPeriod)
        }
      }
      return ''
    },
    stationURL () {
      return '/' + urlCallsign(this.station.station.callsign)
    },
    stationDisplayCallsign () {
      return replace0(this.station.station.callsign.toUpperCase())
    }
  },
  methods: {
    ...mapMutations([MUTATE_ACTIVE_STATIONS_READ]),
    publishChange () {
      this.$emit( 'publish-change' )
    },
    formatDate (dt) {
      return moment(dt, 'DD.MM.YYYY').format( 'DD MMM YYYY' ).toLowerCase()
    },
    updateStatus () {
      if (this._inactive) {
        this[MUTATE_ACTIVE_STATIONS_READ](false)
      }
    }
  },
  watch: {
    online() {
      this.$emit('update:online', this.online)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
