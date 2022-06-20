<template>
    <div>
        <div id="view" @click="toggleCompactView">
           <img v-if="compactView"  id="view_full" src="/static/images/icon_view_full.png" />
           <img v-else id="view_compact" src="/static/images/icon_view_compact.png" />
        </div>

        <div id="active_stations" class="stations_list">
            <template v-for="(stations, idx0) in activeStationsStatus">
                <active-station-entry v-for="(item, idx) in stations"
                    :station-settings="item" :site-admin="siteAdmin" type="active"
                    :compactView="compactView"
                    @publish-change="publishChange(item)" :key="idx0 + '_' + idx">
                </active-station-entry>
            </template>
        </div>
        <div id="future_stations" class="stations_list">
            <div class="stations_block">Coming soon</div>
            <active-station-entry v-for="(station, index) in $store.state.activeStations.stations.future"
                :station-settings="station" :site-admin="siteAdmin" type="inactive"
                :compactView="compactView"
                @publish-change="publishChange(station)" :key="index">
            </active-station-entry>
        </div>
        <div id="archive_stations" class="stations_list">
            <div class="stations_block">Archive</div>
            <active-station-entry v-for="(station, index) in $store.state.activeStations.stations.archive"
                :station-settings="station" :site-admin="siteAdmin" type="archive"
                :compactView="compactView"
                @publish-change="publishChange(station)" :key="index">
            </active-station-entry>
       </div>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapMutations} from 'vuex'

import storage from '../storage'
import {ACTION_POST} from '../store-user'
import {MUTATE_ACTIVE_STATIONS_READ} from '../store-active-stations'

import ActiveStationEntry from '../components/ActiveStationEntry'

const STORAGE_KEY_COMPACT_VIEW = 'activeStationsCompactView'

export default {
  name: 'activeStations',
  components: {ActiveStationEntry},
  data () {
    return {
      compactView: storage.load(STORAGE_KEY_COMPACT_VIEW, 'local')
    }
  },
  activated () {
    this.markRead()
  },
  mounted () {
    this.markRead()
  },
  computed: {
    ...mapGetters(['siteAdmin', 'activeStationsRead', 'activeStationsStatus']),
  },
  methods: {
    ...mapMutations([MUTATE_ACTIVE_STATIONS_READ]),
    ...mapActions([ACTION_POST]),
    markRead () {
      this[MUTATE_ACTIVE_STATIONS_READ]()
    },
    toggleCompactView () {
      this.compactView = !this.compactView
      storage.save(STORAGE_KEY_COMPACT_VIEW, this.compactView, 'local')
    },
    publishChange (station) {
      this[ACTION_POST]({
        path: 'publish',
        data: {station: station.station.callsign, publish: station.publish}
      })
    }
  },
  watch: {
    activeStationsRead () {
      if (!this._inactive) {
        this.markRead()
      }
    }
  }
 
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
