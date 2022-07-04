<template>
    <table id="log">
        <tr>
            <td class="mycall head">My call</td>
            <td class="date head">Date</td>
            <td class="time head">Time<br/><span>{{time}}z</span></td>
            <td class="band head">Freq</td>
            <td class="mode head">Mode</td>
            <td class="urcall head">Callsign</td>
            <td class="qth head" v-for="idx in qthColumns" :key="idx">
                {{qthFieldTitles[idx]}}
            </td>
            <td class="locator head" v-if="logSettings && logSettings.columns.loc">Locator</td>
        </tr>
        <template v-if="data">
            <tr v-for="(spot, idx) in data" :class="{new_qso:spot.new}" :key="idx">
                <td class="mycall">{{$options.replace0(spot.myCS)}}</td>
                <td class="date">{{spot.date}}</td>
                <td class="time">{{spot.time}}</td>
                <td class="band">{{spot.freq}}</td>
                <td class="mode">{{spot.mode}}</td>
                <td class="urcall">
                    <a :href="'https://cfmrda.ru/#?callsign=' + spot.cs" target="_blank" rel="noopener">
                        {{$options.replace0(spot.cs)}}
                    </a>
                </td>
                <td class="rda" v-for="idx in qthColumns" :key="idx">{{spot.qth[idx]}}</td>
                <td class="locator" v-if="logSettings && logSettings.columns.loc">{{spot.loc}}</td>
           </tr>
        </template>
    </table>
</template>

<script>
import {replace0} from '../utils'
export default {
  replace0: replace0,
  name: 'LogTable',
  props: ['data', 'logSettings', 'qthFieldTitles'],
  data () {
    return {
      time: null
    }
  },
  mounted () {
    this.updateTime()
  },
  computed: {
    qthColumns () {
      const r = []
      if (this.logSettings) {
        const qthCount = this.logSettings.columns.qth.length
        for (let c = 0; c < qthCount; c++) {
          if (this.logSettings.columns.qth[c]) {
            r.push(c)
          }
        }
      }
      return r
    }
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
