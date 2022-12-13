<template>
	<div>
		<donate-block></donate-block>
		<div id="info" v-html="stationSettings.station && stationSettings.station.info"></div>
	</div>
</template>

<script>
import DonateBlock from '../components/DonateBlock.vue'

export default {
  name: 'StationInfo',
  props: ['stationSettings'],
  components: { DonateBlock },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
