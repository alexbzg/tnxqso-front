<template>
    <div>
        <div id="status_block_top"
            :class="{status_online: statusData.online, status_offline: !statusData.online}">
            <img 
                v-if="canEdit"
                :src="'/static/images/switch_status_' + (statusData.online ? 'on' : 'off') + '.png'" 
                @click="toggleOnline"
                :title="getString('MANUAL') + ' ONLINE/OFFLINE'" />
            <b>{{caption}}</b>
        </div>
        <table id="status_block_info" v-if="statusData.online">
            <tr>
                <td id="current_loc">
                    <img
                        v-if="canEdit"
                        id="icon_edit_qth" 
                        src="/static/images/icon_edit_qth.png" 
                        :title="getString('EDIT_CURRENT') + ' QTH'" 
                        @click="editQth"
                        />
                    <span class="datetime">
                        {{statusData.date}}  {{statusData.year}} {{statusData.time}}
                    </span><br/>
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
import {mapGetters, mapActions, mapMutations} from 'vuex'

import LocalizationMixin from '../localization-mixin'
import {ACTION_POST} from '../store-user'
import {MUTATE_STATION_STATUS} from '../store-active-stations'
import QTH_PARAMS from '../../public/static/js/qthParams.json'
import showDialog from '../show-dialog'
import EditQthDialog from './EditQthDialog'

export default {
  QTH_PARAMS: QTH_PARAMS,
  mixins: [LocalizationMixin],
  name: 'StationStatus',
  props: ['stationSettings'],
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    ...mapMutations([MUTATE_STATION_STATUS]),
    async postStatus (data) {
      const { data: newStatusData, } = await this[ACTION_POST]({
        path: 'location', 
        data 
      })
      this[MUTATE_STATION_STATUS]({callsign: this.stationCallsign, data: newStatusData})
    },
    async toggleOnline () {
      await this.postStatus({
        qth: {
          fields: {...this.statusData.qth.fields.values},
          loc: this.statusData.qth.loc
        },
        online: !this.statusData.online
      })
    },
    async editQth () {
      const newQth = await showDialog(EditQthDialog, {qth: this.statusData.qth})
      await this.postStatus({
        qth: {
            fields: {...newQth.fields},
            loc: newQth.loc
        },
        online: true
      })
    }
  },
  computed: {
    ...mapGetters(['userStationCallsign', 'stationCallsign']),
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
    },
    canEdit () {
      return this.userStationCallsign === this.stationCallsign && 
        this.stationSettings.status.get === 'manual'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
