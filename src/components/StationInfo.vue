<template>
    <div id="info">
        {{info}}
    </div>
</template>

<script>
export default {
  name: 'StationInfo',
  data () {
    return {
      info: this.$parent.stationInfo
    }
  }
}
</script>

<style scoped>
</style>
