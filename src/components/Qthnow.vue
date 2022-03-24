<template>
    <div id="qthnow">
        <h3>QTHnow (Android, IOS)</h3>
            <img src="/static/images/web_qthnow_01.png">
            <img src="/static/images/web_qthnow_02.png"> &nbsp;&nbsp;&nbsp;
            <img src="/static/images/qthnow_ios_01.jpg">
            <img src="/static/images/qthnow_ios_02.jpg">
            <br/><br/>

        <div id="qthnow_text" v-html="getString('QTHNOW')"></div>
        <br/>
        <a href="https://play.google.com/store/apps/details?id=com.tnxqso.qthnow" target="_blank"><img src="/static/images/btn_google.jpg" class="intext"></a>
        <a href="https://apps.apple.com/ru/app/qthnow/id1532102652" target="_blank"><img src="/static/images/btn_appstore.jpg" class="intext"></a>
        <br/><br/><br/>
    </div>
</template>

<script>
import LocalizationMixin from '../localization-mixin'

export default {
  name: 'qthnow',
  mixins: [LocalizationMixin],
  data () {
    return {
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
