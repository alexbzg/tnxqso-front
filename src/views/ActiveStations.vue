<template>
    <div>

        <div id="view_buttons">
          <div 
            v-for="(value, index) in stationsTypesFilter"
            @click="toggleStationsTypesFilter(index)"
            :class="{ selected_view: value }"
            :key="index">
            <img 
                :src="$options.STATIONS_TYPES_FILTER[index].image" 
                :title="$options.STATIONS_TYPES_FILTER[index].title" />
          </div>

          <!--div id="view" @click="toggleCompactView">
            <img v-if="compactView"  id="view_full" src="/static/images/icon_view_full.png" />
            <img v-else id="view_compact" src="/static/images/icon_view_compact.png" />
          </div-->
        </div>

        <div id="active_stations" class="stations_list">
            <template v-for="(stations, idx0) in activeStationsStatus">
                <active-station-entry v-for="(item, idx) in filterStations(stations)"
                    :station-settings="item" :site-admin="siteAdmin" type="active"
                    :compactView="true"
                    @publish-change="publishChange(item)" :key="idx0 + '_' + idx">
                </active-station-entry>
                <br
                    v-if="idx0 === 0"
                    :key="idx0"/>
            </template>
        </div>
        <div id="future_stations" class="stations_list">
            <div class="stations_block">Coming soon</div>
            <active-station-entry 
                v-for="(station, index) in filterStations($store.state.activeStations.stations.future)"
                :station-settings="station" :site-admin="siteAdmin" type="inactive"
                :compactView="true"
                @publish-change="publishChange(station)" :key="index">
            </active-station-entry>
        </div>
        <div id="archive_stations" class="stations_list">
            <div class="stations_block">Archive</div>
            <active-station-entry 
                v-for="(station, index) in filterStations($store.state.activeStations.stations.archive)"
                :station-settings="station" :site-admin="siteAdmin" type="archive"
                :compactView="true"
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
const STORAGE_KEY_STATIONS_TYPES_FILTER = 'activeStationsStationTypeFilter'

const STATIONS_TYPES_FILTER = [
    {
        filter: /\/M$/,
        image: "/static/images/icon_view_mobile.png",
        title: "Show mobile stations"
    },
    {
        filter: /\/P$/,
        image: "/static/images/icon_view_portable.png",
        title: "Show portable stations"
    },
    {
        filter: /(?<!\/[MP])$/,
        image: "/static/images/icon_view_stationary.png",
        title: "Show stationary stations"
    }
]

export default {
  name: 'activeStations',
  components: {ActiveStationEntry},
  STATIONS_TYPES_FILTER: STATIONS_TYPES_FILTER,
  data () {
    const stationsTypesFilter = storage.load(STORAGE_KEY_STATIONS_TYPES_FILTER, 'local') || 
        STATIONS_TYPES_FILTER.map( () => true )

    return {
      compactView: storage.load(STORAGE_KEY_COMPACT_VIEW, 'local'),
      stationsTypesFilter: stationsTypesFilter
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
    filteredStations () {
      return []
    }
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
    },
    toggleStationsTypesFilter (index) {
      this.$set(this.stationsTypesFilter, index, !this.stationsTypesFilter[index])
      storage.save(STORAGE_KEY_STATIONS_TYPES_FILTER, this.stationsTypesFilter, 'local')
    },
    filterStations (stations) {
      return stations.filter( item => this.stationsTypesFilter.some( (value, index) => 
        value && STATIONS_TYPES_FILTER[index].filter.test(item.station.callsign) ) )
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
