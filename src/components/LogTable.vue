<template>
    <table id="log">
        <tr>
            <td class="mycall head">My call</td>
            <td class="date head">Date</td>
            <td class="time head">Time<br/><span>{{time}}z</span></td>
            <td class="band head">Freq</td>
            <td class="mode head">Mode</td>
            <td class="urcall head">Callsign</td>
            <td class="qth head" 
                v-for="idx in qthColumns" 
                :key="idx">
                {{qthFieldTitles[idx]}}
            </td>
            <td class="locator head" 
                v-if="logSettings && logSettings.columns.loc">
                Locator
            </td>
            <td class="audio head" 
                v-if="logSettings && logSettings.columns.audio">
                Audio
            </td>
        </tr>
        <template v-if="data">
            <tbody
                v-for="(spot, idx) in data" 
                :key="idx">
                <tr :class="{new_qso:spot.new}">
                    <td class="mycall">
                        {{$options.replace0(spot.myCS)}}
                    </td>
                    <td class="date">{{spot.date}}</td>
                    <td class="time">{{spot.time}}</td>
                    <td class="band">{{spot.freq}}</td>
                    <td class="mode">{{spot.mode}}</td>
                    <td class="urcall">
                        <a :href="'https://cfmrda.ru/#?callsign=' + spot.cs" target="_blank" rel="noopener">
                            {{$options.replace0(spot.cs)}}
                        </a>
                    </td>
                    <td class="rda" 
                        v-for="idx in qthColumns" 
                        :key="idx">
                            {{spot.qth[idx]}}
                    </td>
                    <td class="locator" 
                        v-if="logSettings && logSettings.columns.loc">
                        {{spot.loc}}
                    </td>
                    <td class="audio"
                        v-if="logSettings && logSettings.columns.audio">
                        <span v-if="soundRecords && soundRecords.has(spot.sound)"
                            @click="toggleAudioPlayer(spot)">
                            <img class="icon_audio" src="/static/images/icon_audio.png" 
                                title="Click to listen QSO" />
                        </span>
                    </td>

                </tr>
                <tr v-if="audioPlayer == spot">
                    <td 
                        :colspan="columnsCount" 
                        class="audio_player">
                        <audio controls
                            :src="stationPath + spot.sound"/>
                    </td>
                </tr>
            </tbody>
        </template>
    </table>
</template>

<script>

import {replace0} from '../utils'

const PERMANENT_COLUMNS_COUNT = 7

export default {
  replace0: replace0,
  name: 'LogTable',
  props: ['data', 'logSettings', 'qthFieldTitles', 'soundRecords', 'stationUrlCallsign'],
  data () {
    return {
      time: null,
      audioPlayer: null
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
    },
    columnsCount () {
      let r = PERMANENT_COLUMNS_COUNT
      if (this.logSettings) {
        for (const key in this.logSettings.columns) {
          if (Array.isArray(this.logSettings.columns[key])) {
            for (const subEntry of this.logSettings.columns[key]) {
              if (subEntry)
                r++
            }
          } else if (this.logSettings.columns[key])
              r++
        }
      }
      return r 
    },
    stationPath () {
      return '/static/stations/' + this.stationUrlCallsign + '/sound/'
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
    },
    toggleAudioPlayer (spot) {
      this.audioPlayer = this.audioPlayer == spot ? null : spot
    }
  }
}
</script>

<style scoped>
</style>
