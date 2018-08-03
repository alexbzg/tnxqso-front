<template>

    <div id="cluster">
      
    <div id="view_send_form" v-if="!spot.show">
        <input type="button" class="btn4" value="Send spot" 
            @click="spot.show = !spot.show">
    </div>
    
    <form id="send_spot" v-if="spot.show">
      <table id="send_spot_layout">
        <tr>
          <td class="spot_call" style="color: #aaa;">DX call</td>
          <td class="spot_band" style="color: #aaa;">MHz</td>
          <td class="spot_text" style="color: #aaa;">Info</td>
          <td class="spot_spotter" style="color: #aaa;">Your call</td>
          <td class="spot_btn"></td>
        </tr>
        <tr>
          <td class="spot_call"><input type="text" id="spot_call" v-model="spot.cs" disabled /></td>
          <td class="spot_band"><input type="text" id="spot_band" v-model="spot.freq" /></td>
          <td class="spot_text"><input type="text" id="spot_text" v-model="spot.info" /></td>
          <td class="spot_spotter"><input type="text" id="spot_spotter" v-model="spot.userCS" /></td>
          <td class="spot_btn">
              <button id="button_send_spot" class="btn4" :disabled="spot.posting || spot.disabled"
                                                             @click="sendSpot()">
                  Send spot
              </button>
          </td>
        </tr>
        <tr>
          <td class="spot_text text_btns" colspan="5">
            <input type="button" class="add_text_btn" value="RDA" 
                v-if="stationSettings && stationSettings.log.columns.RDA"
                @click="addSpotText('RDA')"/> 
            <input type="button" class="add_text_btn" value="RAFA" 
                v-if="stationSettings && stationSettings.log.columns.RAFA"
                @click="addSpotText('RAFA')"/> 
            <input type="button" class="add_text_btn" value="WFF" 
                v-if="stationSettings && stationSettings.log.columns.WFF"
                @click="addSpotText('WFF')"/> 
            <input type="button" class="add_text_btn" value="Locator" 
                v-if="stationSettings && stationSettings.log.columns.loc"
                @click="addSpotText('loc')"/> 
            <input type="button" class="add_text_btn" 
                v-for="n in $options.USER_FIELDS_COUNT"
                v-if="stationSettings && stationSettings.log.userColumns[n-1]"
                :value="stationSettings.userFields[n-1] || ( 'userField#' + n )"
                @click="addSpotTextUserField(n-1)"/> 
          </td>
        </tr>
      </table>
    </form>

    <div id="spam" class="warning" v-if="spot.show && spot.disable"><div id="warning_border">
        <span>Spam protection!</span> &nbsp; This spot can be sent after <b>{{spot.disable}}</b> second.
    </div></div>
 


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
import {USER_FIELDS_COUNT} from '../constants'
import StationStatus from '../station-status'

import {replace0} from '../utils'
import tabMixin from '../station-tab-mixin'
export default {
  USER_FIELDS_COUNT: USER_FIELDS_COUNT,
  $spotDisableTimeout: null,
  mixins: [tabMixin],
  name: 'StationCluster',
  props: ['user', 'chatUser', 'stationSettings', 'logService', 'statusService'],
  data () {
    return {
      tabId: 'cluster',
      replace0: replace0,
      status: new StationStatus(),
      spot: {
        show: false,
        userCS: this.chatUser,
        info: '',
        freq: null,
        cs: this.stationSettings === null ? '' : this.stationSettings.station.callsign,
        disable: null,
        posting: false
      }
    }
  },
  mounted () {
    this.logService.onUpdate( this.onLogUpdate )
    this.statusService.onUpdate( this.onStatusUpdate )
  },
  beforeDestroy () {
    this.clearSpotDisableTimeout()
  },
  methods: {
    sendSpot () {
      const vm = this
      if (confirm('Do you really want to send this spot?')) {
        this.user.serverPost( 'sendSpot', this.spot )
          .then( function (data) {
            alert( data.sent ? 'Your spot could not be sent.'
              : 'Your spot was sent succeffully.' )
            vm.clearSpotDisableTimeout()
            vm.spot.disable = data.secondsLeft
            vm.setSpotDisableTimeout()
          } )
          .finally( function () { vm.spot.posting = false } )
      }
    },
    addSpotText (field) {
    },
    addSpotTextUserField (n) {
    },
    onLogUpdate () {
      if (this.logService.data.length > 0) {
        const l = this.logService.data[0]
        this.spot.cs = l.myCS
        this.spot.freq = l.freq
      }
    },
    onStatusUpdate () {
      this.status.update( this.statusService.data )
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
      }
    },
    setSpotDisableTimeout (val) {
      this.$spotDisableTimeout = setTimeout( this.updateSpotDisable, 1000 )
    }
  },
  watch: {
    stationSettings: {
      handler: function (val) {
        this.spot.cs = val.station.callsign
      },
      deep: true

    }
  }
}
</script>

<style scoped>
</style>
