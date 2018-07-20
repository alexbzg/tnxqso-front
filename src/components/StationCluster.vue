<template>
    <div id="cluster">
        <table id="cluster">
            <tr v-for="spot in data" :class="{new: spot.new, highlight: spot.highlight}">
                <td class="time">{{spot.time}}z</td>
                <td class="band">{{spot.freq}}</td>
                <td class="mode">{{spot.subMode ? spot.subMode : spot.mode}}</td>
                <td class="call">
                    <a :href="'http://qrz.com/db/' + spot.cs" target="_blank" 
                        rel="noopener" title="Link to QRZ.com">{{replace0(spot.cs)}}</a>
                </td>
                <td class="text">{{spot.text}}</td>
                <td class="spotter">{{spot.de}}</td>
            </tr>
        </table>
        <a href="http://adxcluster.com" target="_blank" rel="noopener">adxcluster.com</a>                   
    </div>
</template>

<script>
import {replace0} from '../utils'
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  name: 'StationCluster',
  data () {
    return {
      tabId: 'cluster',
      replace0: replace0
    }
  }
}
</script>

<style scoped>
</style>
