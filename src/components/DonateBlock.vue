<template>
    <div class="donate_block" :class="$route.path.split('/')[1]">

        <template v-html="'<!-- Yandex.RTB R-A-536531-1 -->'"></template>
        <div id="yandex_rtb_R-A-536531-1"></div>

    </div>
</template>

<script>
export default {
  comments: true,
  name: 'DonateBlock',
  data () {
    return {
      checkCallsign: null
    }
  },
  mounted () {
    const donateScript = document.createElement('script')
    donateScript.setAttribute('src', '/static/js/donate.js')
    document.head.appendChild(donateScript)
  },
  methods: {
    cfmrdaCheck () {
      if (this.checkCallsign) {
        window.open('https://cfmrda.ru/#?callsign=' + this.checkCallsign, '_blank')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
