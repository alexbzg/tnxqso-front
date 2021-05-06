<template>
    <div>
        <div id="view" @click="toggleCompactView">
           <img v-if="compactView"  id="view_full" src="/static/images/icon_view_full.png" />
           <img v-else id="view_compact" src="/static/images/icon_view_compact.png" />
        </div>

        <div id="active_stations" class="stations_list">
            <template v-for="idx0 in [0, 1]">
                <active-stations-entry v-for="(item, index) in activeStations[idx0]"
                    :station="item.station" :site-admin="siteAdmin" type="active"
                    :online.sync="item.online"
                    :compactView="compactView"
                    @publish-change="publishChange(item.station)" :key="idx0 + '_' + index">
                </active-stations-entry>
            </template>
        </div>
        <div id="future_stations" class="stations_list">
            <div class="stations_block">Coming soon</div>
            <active-stations-entry v-for="(station, index) in futureStations"
                :station="station" :site-admin="siteAdmin" type="inactive"
                :compactView="compactView"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
        </div>
        <div id="archive_stations" class="stations_list">
            <div class="stations_block">Archive</div>
            <active-stations-entry v-for="(station, index) in archStations"
                :station="station" :site-admin="siteAdmin" type="archive"
                :compactView="compactView"
                @publish-change="publishChange(station)" :key="index">
            </active-stations-entry>
       </div>
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'
import * as moment from 'moment'

import storage from '../storage'
import request from '../request'
import {ACTION_POST} from '../store-user'

import ActiveStationsEntry from './ActiveStationsEntry'

const STORAGE_KEY_COMPACT_VIEW = 'activeStationsCompactView'

export default {
  name: 'activeStations',
  components: {ActiveStationsEntry},
  data () {
    return {
      compactView: storage.load(STORAGE_KEY_COMPACT_VIEW, 'local'),
      activeStationsAll: [],
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
        const arch = []
        const future = []
        for ( const station in publishData ) {
          if ( ( publishData[station]['user'] && publishData[station]['admin'] ) || this.siteAdmin ) {
            promises.push(request.getJSON('settings', station)
              .then(response => {
                const settings = response.data
                if (settings.station && settings.station.callsign) {
                  settings.publish = { user: settings.publish, admin: publishData[station]['admin'] }
                  const period = settings.station.activityPeriod.map(item => moment(item, 'DD.MM.YYYY'))
                  if ( period && period.length === 2 && period[0] < current &&
                    period[1].add( 1, 'd' ) > current ) {
                    this.activeStationsAll.push( {station: settings, online: false} )
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
            this.archStations = this.sortStations(arch)
            this.futureStations = this.sortStations(future)
          })
      })
  },
  computed: {
    ...mapGetters(['siteAdmin']),
    activeStations () {
      return [true, false].map(value => 
        this.sortStations(this.activeStationsAll.filter(item => item.online === value)))
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    toggleCompactView () {
      this.compactView = !this.compactView
      storage.save(STORAGE_KEY_COMPACT_VIEW, this.compactView, 'local')
    },
    publishChange (station) {
      this[ACTION_POST]({
        path: 'publish',
        data: {station: station.station.callsign, publish: station.publish}
      })
    },
    sortStations (stations) {
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
      return r
    }
  }
  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
