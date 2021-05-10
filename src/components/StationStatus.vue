<template>
    <div>
        <div id="status_block_top" 
            :class="{status_online: statusData.online, status_offline: !statusData.online}">
            <b>{{caption}}</b>
        </div>
        <table id="status_block_info" v-if="statusData.online">
            <tr>
                <td id="current_loc">
                    <span class="datetime">{{statusData.date}}  {{statusData.year}} {{statusData.time}}</span><br/>
                    <template v-for="(value, idx) in statusData.qth.fields.values">
                        <span v-if="value" class="qth_field" :key="idx">
                            <template v-if="statusData.qth.fields.titles[idx] !== 
                                $options.QTH_PARAMS.defaultTitle">
                                {{statusData.qth.fields.titles[idx]}}&nbsp;
                            </template>
                            <b>{{value}}</b><br/>
                        </span>
                    </template>
                    <template v-if="statusData.qth.loc">
                        <b>{{statusData.qth.loc}}</b><br/>
                    </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import QTH_PARAMS from '../../public/static/js/qthParams.json'

export default {
  QTH_PARAMS: QTH_PARAMS,
  name: 'StationStatus',
  props: ['stationSettings'],
  data () {
    return {
    }
  },
  computed: {
    stationCallsign () {
      return this.stationSettings.station ? this.stationSettings.station.callsign : null
    },
    statusData () {
      return this.stationCallsign && this.stationCallsign in this.$store.state.activeStations.stations.active ? 
        this.$store.state.activeStations.stations.active[this.stationCallsign].status : {}
    },
    caption () {
      return this.statusData.online ? (this.statusData.freqDisplay ? this.statusData.freqDisplay : 'ONLINE')
        : 'OFFLINE'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
