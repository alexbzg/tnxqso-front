<template>
    <div id="cluster">
        <table id="log">
            <tr>
                <td class="mycall" style="border-top:none; border-left: none;">&nbsp;</td>
                <td class="date head">Date</td>
                <td class="time head">Time</td>
                <td class="band head">Freq</td>
                <td class="mode head">Mode</td>
                <td class="urcall head">Callsign</td>
                <td class="rst head">RST/RST</td>
                <td class="rda head">RDA</td>
                <td class="rafa head">RAFA</td>
                <td class="wff head">WFF</td>
                <td class="locator head">Locator</td>
            </tr>
            <template v-if="service.data">
                <tr v-for="spot in service.data.slice( 0, 50 )" :class="{new_qso:spot.new}">
                    <td class="mycall">{{spot.myCS}}</td>
                    <td class="date">{{spot.date}}</td>
                    <td class="time">{{spot.time}}</td>
                    <td class="band">{{spot.freq}}</td>
                    <td class="mode">{{spot.mode}}</td>
                    <td class="urcall">{{spot.cs}}</td>
                    <td class="rst">{{spot.rcv}}/{{spot.snt}}</td>
                    <td class="rda">{{spot.rda}}</td>
                    <td class="rafa">{{spot.rafa}}</td>
                    <td class="wff">{{spot.wff}}</td>
                    <td class="locator">{{spot.loc}}</td>
                </tr>
            </template>
        </table>
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  name: 'StationLog',
  data () {
    return {
      tabId: 'log'
    }
  }
}
</script>

<style scoped>
</style>
