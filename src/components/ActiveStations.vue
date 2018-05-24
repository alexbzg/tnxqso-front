<template>
    <div id="active_stations">
        <div v-for="station in stations" v-if="station.publish || siteAdmin">
            <input type="checkbox" v-model="station.publish"
                @change="publishChange( station )" v-if="siteAdmin"/>
            <a :href="'/' + station.station.callsign.replace( /\//, '-' ).toLowerCase()"><span class="callsign">{{station.station.callsign.toUpperCase()}}</span>
                <span class="title">{{station.station.title}}</span>
                <span class="period" 
                    v-if="station.station.activityPeriod && station.station.activityPeriod.length == 2">
                    ({{formatDate(station.station.activityPeriod[0])}} &mdash; 
                    {{formatDate(station.station.activityPeriod[1])}})
                </span>
            </a>
        </div>
    </div>
</template>

<script>
import request from './../request'
import * as moment from 'moment'

export default {
  name: 'activeStations',
  props: ['user'],
  data () {
    return {
      stations: [],
      siteAdmin: this.user.siteAdmin
    }
  },
  computed: {
/*    siteAdmin () {
      return this.user.siteAdmin
    } */
  },
  mounted () {
    const vm = this
    request.get( '/static/js/publish.json' )
      .then( function ( response ) {
        const publishData = response.data
        for ( const station in publishData ) {
          if ( publishData[station]['user'] ) {
            request.get( '/static/stations/' + station.replace( /\//, '-' ).toLowerCase() + '/settings.json' )
              .then( function ( response ) {
                const settings = response.data
                settings.publish = publishData[station]['admin']
                vm.stations.push( settings )
              })
          }
        }
      })
  },
  methods: {
    publishChange (station) {
      this.user.serverPost( 'publish', { station: station.station.callsign, publish: station.publish } )
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
