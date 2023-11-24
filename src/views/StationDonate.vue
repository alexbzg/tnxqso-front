<template>
    <div id="donate">
        <div id="text">
            <static-display url='donateText.html'/>
        </div>
        <div>
           <static-display url='donateCode.html'/>
        </div>
    </div>
</template>

<script>
import {mapMutations} from 'vuex'

import {MUTATE_STATION_READ} from '../store-station-settings'
import StaticDisplay from '../components/StaticDisplay'

export default {
  name: 'StationDonate',
  props: ['stationSettings'],
  components: {StaticDisplay},
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
