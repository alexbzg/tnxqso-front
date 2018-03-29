<template>
    <div id="active_stations">
        <div v-for="station in stations" v-if="station.publish || siteAdmin">
            <a :href="'/' + station.station.callsign.replace( /\//, '-' ).toLowerCase()">{{station.station.callsign}}</a>
            {{station.station.title}}<br/>
            <template v-if="siteAdmin">
                Publish
                <input type="checkbox" v-model="station.publish"
                    @change="publishChange( station )"/>
            </template>
        </div>
    </div>
</template>

<script>
import request from './../request'
export default {
  name: 'activeStations',
  props: ['user'],
  data () {
    return {
      stations: []

    }
  },
  computed: {
    siteAdmin () {
      return this.user.siteAdmin
    }
  },
  mounted () {
    const vm = this
    request.get( '/static/js/publish.json' )
      .then( function ( response ) {
        const publishData = response.data
        for ( const station in publishData ) {
          if ( publishData[station]['user'] ) {
            request.get( '/static/stations/' + station + '/settings.json' )
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
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
