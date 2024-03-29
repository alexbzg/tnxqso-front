<template>

    <div id="cluster">

    <div id="view_send_form" v-if="!spot.show && emailConfirmed">
        <input type="button" class="btn4" value="Send spot"
            @click="spot.show = !spot.show">
    </div>

    <table id="send_spot_layout" v-if="spot.show">
        <tr>
            <td class="spot_call" style="color: #aaa;">DX call</td>
            <td class="spot_band" style="color: #aaa;">kHz</td>
            <td class="spot_text" style="color: #aaa;">Info</td>
            <td class="spot_spotter" style="color: #aaa;">Your call</td>
            <td class="spot_btn"></td>
        </tr>
        <tr>
            <td class="spot_call"><input type="text" id="spot_call" v-model="spot.cs" disabled /></td>
            <td class="spot_band"><input type="number" id="spot_band" v-model="spot.freq" /></td>
            <td class="spot_text"><input type="text" id="spot_text" v-model="spot.info" /></td>
            <td class="spot_spotter"><input type="text" id="spot_spotter" v-model="spot.userCS" /></td>
            <td class="spot_btn">
                <button id="button_send_spot" class="btn4" :disabled="sendSpotButtonDisabled"
                                                                @click="sendSpot()">
                    Send spot
                </button>
            </td>
        </tr>
        <tr>
            <td class="spot_text text_btns" colspan="5">
                <input type="button" class="add_text_btn" v-for="(item, idx) in qthLines" :value="item"
                    @click="addSpotText(item)" :key="idx"/>
                <input type="button" class="add_text_btn" :value="statusData.qth.loc"
                    v-if="statusData && statusData.qth.loc"
                    @click="addSpotText(statusData.qth.loc)"/>
                <input type="button" class="add_text_btn" value="UP"
                    @click="addSpotText('UP', true)"/>
                <input type="button" class="add_text_btn" value="FT8"
                    @click="addSpotText('FT8', true)"/>
                <input type="button" class="add_text_btn" value="FT4"
                    @click="addSpotText('FT4', true)"/>

            </td>
        </tr>
    </table>

    <div id="spam" class="warning" v-if="spot.show && spot.disable && spot.showDisable"><div id="warning_border">
        <span>Spam protection!</span> &nbsp; This spot can be sent after <b>{{spot.disable}}</b>
        second{{spot.disable > 1 ? 's' : ''}}.
    </div></div>

    <div id="spot_sent" class="ok_window" v-if="spot.success"><div id="ok_border">
        <span>OK!</span> &nbsp; Your spot was successfully sent.
    </div></div>

    <div id="cluster_error" class="warning" v-if="spot.error"><div id="warning_border">
        {{spot.error}}
    </div></div>

    <div id="cluster_filter">
      <template
        v-for="mode in $options.MODES"
      >
      <input 
        type="checkbox" 
        :key="mode"
        @change="filterChange"
        v-model="filter.modes[mode]"/>
        {{mode}}
      </template>
    </div>

        <table id="cluster">
            <tr v-for="(spot, idx) in clusterSpots" :class="{new: spot.new, highlight: spot.highlight}" :key="idx">
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
    </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import {USER_FIELDS_COUNT, CLUSTER_SPOT_TEXT_LIMIT} from '../constants'
import { MODES } from '../ham-radio'
import StationStatus from '../station-status'
import {ACTION_POST} from '../store-user'
import QTH_PARAMS from '../../public/static/js/qthParams.json'

import {replace0} from '../utils'
import tabMixin from '../station-tab-mixin'
import storage from '../storage'

const CLUSTER_FILTER_STORAGE_KEY = 'clusterFilter'

export default {
  USER_FIELDS_COUNT,
  MODES,
  $spotDisableTimeout: null,
  $clusterResultTimeout: null,
  mixins: [tabMixin],
  name: 'StationCluster',
  props: ['stationSettings', 'logService'],
  data () {
    return {
      tabId: 'cluster',
      replace0: replace0,
      stationStatus: new StationStatus(),
      spot: {
        show: false,
        userCS: this.$store.getters.chatCallsign,
        info: 'www.TNXQSO.com',
        freq: null,
        cs: !this.stationSettings || !this.stationSettings.station ? '' : this.stationSettings.station.callsign,
        disable: null,
        showDisable: false,
        success: false,
        error: false,
        posting: false
      },
      filter: storage.load(CLUSTER_FILTER_STORAGE_KEY, 'local') || 
            { modes: MODES.reduce((acc, mode) => ({ ...acc, [mode]: true }), {} ) }
    }
  },
  mounted () {
    this.logService.onUpdate( this.onLogUpdate )
  },
  beforeDestroy () {
    this.clearSpotDisableTimeout()
    if (this.$spotSuccessTimeout) {
      clearTimeout(this.$spotSuccessTimeout)
    }
  },
  methods: {
    ...mapActions([ACTION_POST]),
    sendSpot () {
      const vm = this
      if (this.spot.disable) {
        this.spot.showDisable = true
        return
      }
      this.spot.posting = true
      this[ACTION_POST]({path: 'sendSpot', data: this.spot})
        .then( function (response) {
          if (response.data.sent) {
            vm.spot.success = true
            vm.$spotSuccessTimeout = setTimeout(vm.clusterResultTimeout, 5000)
          } else {
            if (response.data.reply) {
              vm.spot.error = 'Your spot could not be sent. Cluster reply was: \'' +
                response.data.reply + '\''
              vm.$spotSuccessTimeout = setTimeout(vm.clusterResultTimeout, 5000)
            } else {
              vm.spot.showDisable = true
            }
          }
          vm.clearSpotDisableTimeout()
          vm.spot.disable = Math.ceil( response.data.secondsLeft )
          vm.setSpotDisableTimeout()
        })
        .finally( function () { vm.spot.posting = false } )
    },
    filterChange () {
      storage.save(CLUSTER_FILTER_STORAGE_KEY, this.filter, 'local')
    },
    addSpotText (txt, start) {
      let info = this.spot.info
      if ( !info.includes( txt ) ) {
        if (start) {
          info = txt + ( info ? ' ' : '' ) + info
        } else {
          if (info.includes('TNXQSO.com')) {
            info = info.replace( /(\s)?(www\.)?(TNXQSO\.com)$/, '$1' + txt + ' $2$3' )
          } else {
            info += ( info ? ' ' : '' ) + txt
          }
        }
      }
      if (info.length > CLUSTER_SPOT_TEXT_LIMIT) {
        info = info.replace( 'www.', '' )
      }
      if (info.length > CLUSTER_SPOT_TEXT_LIMIT) {
        info = info.replace( ' TNXQSO.com', '' )
      }
      this.spot.info = info
    },
    clusterResultTimeout () {
      this.spot.success = false
      this.spot.error = false
    },
    onLogUpdate () {
      if (this.statusData.freqDisplay) {
        this.spot.freq = this.statusData.freqDisplay
      }
      if (this.logService.data && this.logService.data.length > 0) {
        const l = this.logService.data[0]
        this.spot.cs = l.myCS
        if (!this.freq) {
          this.spot.freq = l.freq
        }
      }
    },
    clearSpotDisableTimeout () {
      if ( this.$spotDisableTimeout ) {
        clearTimeout( this.$spotDisableTimeout )
      }
    },
    updateSpotDisable () {
      this.spot.disable--
      if (this.spot.disable > 0) {
        this.setSpotDisableTimeout()
      } else {
        this.spot.disable = null
        this.spot.showDisable = false
      }
    },
    setSpotDisableTimeout () {
      this.$spotDisableTimeout = setTimeout( this.updateSpotDisable, 1000 )
    }
  },
  watch: {
    stationSettings: {
      handler: function (val) {
        this.spot.cs = val.station.callsign
      },
      deep: true
    },
    statusData: {
      handler: function () {
        if (this.statusData.freqDisplay) {
          this.spot.freq = this.statusData.freqDisplay
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['chatCallsign', 'emailConfirmed', 'stationCallsign']),
    statusData () {
      return this.stationCallsign && this.stationCallsign in this.$store.state.activeStations.stations.active ?
        this.$store.state.activeStations.stations.active[this.stationCallsign].status : {}
    },
    sendSpotButtonDisabled () {
      return this.spot.posting || this.spot.showDisable || !this.spot.userCS || this.spot.userCS === '' ||
        !this.spot.cs || this.spot.cs === '' || !this.spot.freq
    },
    qthLines () {
      const r = []
      if (this.statusData) {
        const qthFields = this.statusData.qth.fields
        for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
          if (qthFields.values[co]) {
            r.push((qthFields.titles[co] === QTH_PARAMS.defaultTitle ? '' : qthFields.titles[co] + ' ') +
              qthFields.values[co])
          }
        }
      }
      return r
    },
    clusterSpots () {
      return this.data.filter( (spot) => this.filter.modes[spot.mode] )
    }
  }
}
</script>

<style scoped>
</style>
