<template>
    <div id="donate">
        <div id="text" v-html="stationSettings.donate.text">
        </div>
        <div id="code" v-html="stationSettings.donate.code">
        </div>
    </div>
</template>

<script>
export default {
  name: 'StationDonate',
  props: ['stationSettings'],
  data () {
    return {
    }
  }
}
</script>

<style scoped>
</style>
