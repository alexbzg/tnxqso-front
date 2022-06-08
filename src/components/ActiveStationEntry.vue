<template>
    <div v-if="stationSettings.publish || siteAdmin" class="one_station" 
        :class="{compact: compactView, offline: !statusData.online}">
        <span class="callsign">
            <template v-if="siteAdmin">
                <input type="checkbox" v-model="stationSettings.publish.admin" @change="publishChange()"/>
                <input type="checkbox" v-model="stationSettings.publish.user" @change="publishChange()"/>
            </template>
            <component :is="compactView ? 'a' : 'span'" :href="stationURL + '#/info'">
                {{stationDisplayCallsign}}
            </component>
        </span>

        <component :is="compactView ? 'a' : 'span'" :href="stationURL + '#/info'">
            <span class="status" v-if="type == 'active' || compactView">
                <span class="offline_text">OFFLINE</span>
                <span class="freq" v-if="statusData.freqDisplay">{{statusData.freqDisplay}}</span>
                <span class="qth_info">
                    <template v-for="(value, idx) in fieldsValues">
                        {{value}}<br :key="idx"/>
                    </template>
                    <template v-if="statusData.qth && statusData.qth.loc">
                        {{statusData.qth.loc}}<br/>
                    </template>
                </span>
                <span class="links" v-if="compactView">
                    <a :href="stationURL + '#/log'" v-if="stationSettings.enable.log">LOG</a>
                    <a :href="stationURL + '#/map'" v-if="stationSettings.enable.map">MAP</a>
                    <a :href="stationURL + '#/chat'" v-if="stationSettings.enable.chat">CHAT</a>
                </span>
            </span>
        </component>

        <span class="station_full_info" v-if="!compactView">
            <div class="links">
                <a :href="stationURL + '#/info'" v-if="stationSettings.enable.stationInfo">Info</a>
                <a :href="stationURL + '#/log'" v-if="stationSettings.enable.log">Log</a>
                <a :href="stationURL + '#/map'" v-if="stationSettings.enable.map">Map</a>
                <a :href="stationURL + '#/cluster'" v-if="stationSettings.enable.cluster">Cluster</a>
                <a :href="stationURL + '#/stats'" v-if="stationSettings.enable.stats">Stats</a>
                <a :href="stationURL + '#/chat'" v-if="stationSettings.enable.chat">Chat</a>
                <a :href="stationURL + '#/gallery'" v-if="stationSettings.enable.gallery">Gallery</a>
                <a :href="stationURL + '#/donate'" v-if="stationSettings.enable.donate">Donate</a>
            </div>
            <div class="title">{{stationSettings.station.title}}</div>
            <div class="period" v-if="period">{{period}}</div>
        </span>

    </div>
</template>

<script>
import * as moment from 'moment'

import {replace0, urlCallsign, formatPeriod} from '../utils'

import StationStatus from './StationStatus'

export default {
  name: 'ActiveStationEntry',
  extends: StationStatus,
  props: ['compactView', 'siteAdmin', 'type'],
  computed: {
    fieldsValues () {
      return this.statusData.qth && this.statusData.qth.fields ?
        this.statusData.qth.fields.values.filter(item => item) : []
    },
    period () {
      if (this.stationSettings.station.activityPeriod &&
        this.stationSettings.station.activityPeriod.length) {
        if (this.stationSettings.station.activityPeriod.length < 2) {
          return this.formatDate(this.stationSettings.station.activityPeriod[0])
        } else {
          return formatPeriod(this.stationSettings.station.activityPeriod)
        }
      }
      return ''
    },
    stationURL () {
      return '/' + urlCallsign(this.stationSettings.station.callsign)
    },
    stationDisplayCallsign () {
      return replace0(this.stationSettings.station.callsign.toUpperCase())
    }
  },
  methods: {
    publishChange () {
      this.$emit( 'publish-change' )
    },
    formatDate (dt) {
      return moment(dt, 'DD.MM.YYYY').format( 'DD MMM YYYY' ).toLowerCase()
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
