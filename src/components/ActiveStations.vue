<template>
    <div>
        <div id="active_stations">
            <active-stations-entry v-for="station in activeStations" :station="station" :site-admin="siteAdmin"
                @publish-change="publishChange(station)">
            </active-stations-entry>
        </div>
        <div id="arch_stations">
            <active-stations-entry v-for="station in archStations" :station="station" :site-admin="siteAdmin"
                @publish-change="publishChange(station)">
            </active-stations-entry>
        </div>
    </div>
</template>

<script>
import request from '../request'
import * as moment from 'moment'

import ActiveStationsEntry from './ActiveStationsEntry'

export default {
  name: 'activeStations',
  props: ['user'],
  components: { ActiveStationsEntry },
  data () {
    return {
      activeStations: [],
      archStations: [],
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
        const current = moment()
        for ( const station in publishData ) {
          if ( publishData[station]['user'] ) {
            request.get( '/static/stations/' + station.replace( /\//, '-' ).toLowerCase() + '/settings.json' )
              .then( function ( response ) {
                const settings = response.data
                settings.publish = publishData[station]['admin']
                if ( settings.station.period && settings.station.period.length === 2 &&
                  settings.station.period[0] < current && settings.station.period[1] > current ) {
                  vm.activeStations.push( settings )
                } else {
                  vm.archStations.push( settings )
                }
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
