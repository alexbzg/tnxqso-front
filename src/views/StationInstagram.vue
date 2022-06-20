<template>
    <div id="instagram" v-if="stationSettings && stationSettings.instagramID">
    <br/>
      <iframe :src="'//widget.instagramm.ru/?imageW=5&imageH=3&thumbnail_size=188&type=0&typetext=' + stationSettings.instagramID + '&head_show=0&profile_show=0&shadow_show=0&bg=255,255,255,1&opacity=true&head_bg=46729b&subscribe_bg=ad4141&border_color=ffffff&head_title='" allowtransparency="true" frameborder="0" scrolling="no" style="border:none;overflow:hidden;width:1000px;height:619px;"></iframe>       
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
