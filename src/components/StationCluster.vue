<template>
    <div id="cluster">
        <table id="cluster">
            <tr v-for="spot in data" :class="{new: spot.new}">
                <td class="time">{{spot.time}}z</td>
                <td class="band">{{spot.freq}}</td>
                <td class="mode">{{spot.subMode ? spot.subMode : spot.mode}}</td>
                <td class="call">{{spot.cs}}</td>
                <td class="text">{{spot.text}}</td>
                <td class="spotter">{{spot.de}}</td>
            </tr>
        </table>
        <a href="http://adxcluster.com" target="_blank" rel="noopener">adxcluster.com</a>                   
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  name: 'StationCluster',
  data () {
    return {
      tabId: 'cluster'
    }
  }
}
</script>

<style scoped>
</style>
