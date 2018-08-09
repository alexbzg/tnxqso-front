<template>
    <table id="log">
        <tr>
            <td class="mycall head">My call</td>
            <td class="date head">Date</td>
            <td class="time head">Time<br/><span>{{time}}z</span></td>
            <td class="band head">Freq</td>
            <td class="mode head">Mode</td>
            <td class="urcall head">Callsign</td>
            <td class="rst head">RST/RST</td>
            <td class="rda head" v-if="logSettings.columns.RDA">RDA</td>
            <td class="rafa head" v-if="logSettings.columns.RAFA">RAFA</td>
            <td class="wff head" v-if="logSettings.columns.WFF">WFF</td>
            <td class="locator head" v-if="logSettings.columns.loc">Locator</td>
            <td class="user head" v-for="uc in logSettings.userColumns" v-if="uc.enabled">{{uc.column}}</td>
        </tr>
        <template v-if="data">
            <tr v-for="spot in data" :class="{new_qso:spot.new}">
                <td class="mycall">{{$options.replace0(spot.myCS)}}</td>
                <td class="date">{{spot.date}}</td>
                <td class="time">{{spot.time}}</td>
                <td class="band">{{spot.freq}}</td>
                <td class="mode">{{spot.mode}}</td>
                <td class="urcall">{{$options.replace0(spot.cs)}}</td>
                <td class="rst">{{spot.rcv}}/{{spot.snt}}</td>
                <td class="rda" v-if="logSettings.columns.RDA">{{spot.rda}}</td>
                <td class="rafa" v-if="logSettings.columns.RAFA">{{spot.rafa}}</td>
                <td class="wff" v-if="logSettings.columns.WFF">{{spot.wff}}</td>
                <td class="locator" v-if="logSettings.columns.loc">{{spot.loc}}</td>
                <td class="user" v-for="(uc, idx) in logSettings.userColumns" v-if="uc.enabled">
                    {{spot.userFields ? spot.userFields[idx] : null}}
                </td>
           </tr>
        </template>
    </table>
</template>

<script>
import {replace0} from '../utils'
export default {
  replace0: replace0,
  name: 'LogTable',
  props: ['data', 'logSettings'],
  data () {
    return {
      time: null
    }
  },
  mounted () {
    this.updateTime()
  },
  beforeDestroy () {
    clearTimeout( this.updateTimeTimeout )
  },
  methods: {
    updateTime () {
      const n = new Date()
      let min = n.getUTCMinutes()
      if ( min < 10 ) {
        min = '0' + min
      }
      let hr = n.getUTCHours()
      if ( hr < 10 ) {
        hr = '0' + hr
      }
      this.time = hr + ':' + min
      this.updateTimeTimeout = setTimeout( this.updateTime, ( 60 - n.getUTCSeconds() ) * 1000 )
    }
  }
}
</script>

<style scoped>
</style>
