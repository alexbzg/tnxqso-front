<template>
    <div class="donate_block" :class="$route.path.split('/')[1]">
        <template v-html="'<!-- Yandex.RTB R-A-536531-1 -->'"></template>
        <div id="yandex_rtb_R-A-536531-1"></div>
        <br/>
        <form style="background: url('/static/images/cfmrda_form_bg.png') no-repeat top left; width: 160px; height: 160px; text-align: center; padding: 0; display: inline-block;" @submit.prevent="cfmrdaCheck()">
          <a href="https://cfmrda.ru" target="_blank" style="border: none;"><img src="/static/images/clear_btn.png"  title="Check your CFMRDA rating now" height="95" /></a>
          <input type="text" name="callsign2check" v-model="checkCallsign" 
            placeholder="Enter callsign" v-capitalize
            style="width: 130px; background-color: #fff; text-align: center; font-weight: bold; margin-bottom: 5px; border: 1px solid #777; padding: 3px 2px; margin: 0; font-size: 14px; line-height: 14px;" /><br/>
          <input type="submit" name="send2check" value="Check" style="padding: 1px 10px; border: 1px solid #777; font-size: 14px; line-height: 14px;" />
        </form>
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
