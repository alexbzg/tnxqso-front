<template>
    <div id="instagram" v-if="stationSettings.instagramID">
        <iframe :src="'https://auen.ru/instablock.php?u=' + stationSettings.instagramID + '&count=8&w=200&fw=850&fh=550&il=0&tb=' + stationSettings.station.callsign + '&cb=0&st=1&tl= &cl=2'" style="width:850px;height:550px;border:solid 1px #ccc;"></iframe>
    </div>
</template>

<script>
export default {
  name: 'StationInstagram',
  props: ['stationSettings'],
  data () {
    return {
      tabId: 'inst'
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
</style>
