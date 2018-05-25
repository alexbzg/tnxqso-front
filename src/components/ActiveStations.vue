<template>
    <div>
        <div id="active_stations" class="stations_list">
            <div class="stations_block">Active now</div>
            <active-stations-entry v-for="(station, index) in activeStations" 
                :station="station" :site-admin="siteAdmin"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
        </div>
        <div id="arch_stations" class="stations_list">
            <div class="stations_block">Inactive</div>
            <active-stations-entry v-for="(station, index) in archStations" 
                :station="station" :site-admin="siteAdmin"
                @publish-change="publishChange(station)" :key="index">
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
                const period = settings.station.activityPeriod
                if ( period && period.length === 2 && moment(period[0]) < current &&
                  moment(period[1]) > current ) {
                  vm.activeStations.push( settings )
                } else {
                  vm.archStations.push( settings )
                }
                vm.activeStations = vm.activeStations.sort( vm.sortStations )
                vm.archStations = vm.archStations.sort( vm.sortStations )
              })
          }
        }
      })
  },
  methods: {
    publishChange (station) {
      this.user.serverPost( 'publish', { station: station.station.callsign, publish: station.publish } )
    },
    sortStations (a, b) {
      if (a.station.callsign.toLowerCase() < b.station.callsign.toLowerCase()) {
        return -1
      }
      if (a.station.callsign.toLowerCase() > b.station.callsign.toLowerCase()) {
        return 1
      }
      return 0
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
