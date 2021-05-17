<template>
    <div id="info" v-html="stationSettings.station && stationSettings.station.info">
    </div>
</template>

<script>
export default {
  name: 'StationInfo',
  props: ['stationSettings'],
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
