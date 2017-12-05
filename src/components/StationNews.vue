<template>
    <div id="news">
        <template v-for="item in service.data">
            <div class="date" :class="{new: item.new}">{{item.time}}</div>
            <div class="info" v-html="item.text" :class="{new: item.new}"></div>               
        </template>
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  name: 'StationNews',
  data () {
    return {
      tabId: 'news',
      data: {}
    }
  }
}
</script>

<style scoped>
</style>
