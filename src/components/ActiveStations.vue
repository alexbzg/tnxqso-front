<template>
    <div>
        <div id="active_stations" class="stations_list">
            <div class="stations_block">Active now</div>
            <active-stations-entry v-for="(station, index) in activeStations" 
                :station="station" :site-admin="siteAdmin" type="active"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
        </div>
        <div id="arch_stations" class="stations_list">
            <div class="stations_block">Coming soon</div>
            <active-stations-entry v-for="(station, index) in futureStations" 
                :station="station" :site-admin="siteAdmin" type="inactive"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
        </div>
        <div id="ended_stations" class="stations_list">
            <div class="stations_block">Archive</div>
            <active-stations-entry v-for="(station, index) in archStations" 
                :station="station" :site-admin="siteAdmin" type="archive"
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
        const promises = []
        const active = []
        const arch = []
        const future = []
        for ( const station in publishData ) {
          if ( ( publishData[station]['user'] && publishData[station]['admin'] ) || this.siteAdmin ) {
            promises.push(request.getJSON('settings', station)
              .then(response => {
                const settings = response.data
                if (settings.station && settings.station.callsign) {
                  settings.publish = { user: settings.publish, admin: publishData[station]['admin'] }
                  const period = settings.station.activityPeriod
                  if ( period && period.length === 2 && moment(period[0]) < current &&
                    moment(period[1]).add( 1, 'd' ) > current ) {
                    active.push( settings )
                  } else if ( period && period.length === 2 && moment(period[0]) > current ) {
                    future.push( settings )
                  } else {
                    arch.push( settings )
                  }
                }
              })
              .catch( e => e))
          }
        }
        Promise.all(promises)
          .then(() => {
            console.log(this)
            this.activeStations = this.sortStations(active)
            this.archStations = this.sortStations(arch)
            this.futureStations = this.sortStations(future)
          })
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
    sortStations (stations) {
      console.log('---------------sortStations----------------')
      function cmpStations (a, b) {
        if (a.station.callsign.toLowerCase() < b.station.callsign.toLowerCase()) {
          return -1
        }
        if (a.station.callsign.toLowerCase() > b.station.callsign.toLowerCase()) {
          return 1
        }
        return 0
      }
      const r = stations.sort(cmpStations)
      console.log(r)
      return r
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
