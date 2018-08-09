<template>
    <div v-if="station.publish || siteAdmin">
        <template v-if="siteAdmin">
            <input type="checkbox" v-model="station.publish.admin" @change="publishChange()"/>
            <input type="checkbox" v-model="station.publish.user" @change="publishChange()"/>
        </template>
        <a :href="'/' + $options.urlCallsign(station.station.callsign)">
            <span class="callsign">{{$options.replace0(station.station.callsign.toUpperCase())}}</span>
            <span class="title">{{station.station.title}}</span>
            <span class="period" 
                v-if="station.station.activityPeriod && station.station.activityPeriod.length == 2">
                ({{formatDate(station.station.activityPeriod[0])}} &mdash; 
                {{formatDate(station.station.activityPeriod[1])}})
            </span>
        </a>
    </div>
</template>

<script>
import * as moment from 'moment'

import {replace0, urlCallsign} from '../utils'

export default {
  replace0: replace0,
  urlCallsign: urlCallsign,
  name: 'activeStations',
  props: ['siteAdmin', 'station'],
  data () {
    return {
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
