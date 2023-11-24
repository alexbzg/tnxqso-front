<template>
	<div>
		<donate-block></donate-block>
		<div id="info">
            <static-display url="stationInfo.html"/>
        </div>
	</div>
</template>

<script>
import DonateBlock from '../components/DonateBlock'
import StaticDisplay from '../components/StaticDisplay'

export default {
  name: 'StationInfo',
  props: ['stationSettings'],
  components: { DonateBlock, StaticDisplay },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
