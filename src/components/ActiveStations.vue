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
            <div class="stations_block">Coming soon</div>
            <active-stations-entry v-for="(station, index) in futureStations" 
                :station="station" :site-admin="siteAdmin"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
        </div>
        <div id="ended_stations" class="stations_list">
            <div class="stations_block">Archive</div>
            <active-stations-entry v-for="(station, index) in archStations" 
                :station="station" :site-admin="siteAdmin" :hide-period="true"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
       </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import * as moment from 'moment'

import request from '../request'
import {ACTION_POST} from '../store-user'

import ActiveStationsEntry from './ActiveStationsEntry'

export default {
  name: 'activeStations',
  components: {ActiveStationsEntry},
  data () {
    return {
      activeStations: [],
      archStations: [],
      futureStations: []
    }
  },
  mounted () {
    request.get( '/static/js/publish.json' )
      .then(response => {
        const publishData = response.data
        const current = moment()
        for ( const station in publishData ) {
          if ( ( publishData[station]['user'] && publishData[station]['admin'] ) || this.siteAdmin ) {
            request.getJSON('settings', station)
              .then(response => {
                const settings = response.data
                settings.publish = { user: settings.publish, admin: publishData[station]['admin'] }
                const period = settings.station.activityPeriod
                if ( period && period.length === 2 && moment(period[0]) < current &&
                  moment(period[1]).add( 1, 'd' ) > current ) {
                  this.activeStations.push( settings )
                } else if ( period && period.length === 2 && moment(period[0]) > current ) {
                  this.futureStations.push( settings )
                } else {
                  this.archStations.push( settings )
                }
                this.activeStations = this.activeStations.sort(this.sortStations)
                this.archStations = this.archStations.sort(this.sortStations)
              })
          }
        }
      })
  },
  computed: {
    ...mapGetters(['siteAdmin'])
  },
  methods: {
    ...mapActions([ACTION_POST]),
    publishChange (station) {
      this[ACTION_POST]({
        path: 'publish',
        data: {station: station.station.callsign, publish: station.publish}
      })
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
