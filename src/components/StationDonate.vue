<template>
    <div id="donate">
        <div id="text" v-html="stationSettings.donate.text">
        </div>
        <div id="code" v-html="stationSettings.donate.code">
        </div>
    </div>
</template>

<script>
import {mapMutations} from 'vuex'

import {MUTATE_STATION_READ} from '../store-station-settings'

export default {
  name: 'StationDonate',
  props: ['stationSettings'],
  data () {
    return {
    }
  },
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      vm.setStationDataRead()
    })
  },
  methods: {
    ...mapMutations([MUTATE_STATION_READ]),
    setStationDataRead () {
      this[MUTATE_STATION_READ]('donate')
    }
  }
}
</script>

<style scoped>
</style>
