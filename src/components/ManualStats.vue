<template>
    <tbody>
        <template v-if="isStationAdmin">
            <tr 
                v-for="field, idx in manualStats"
                :key="idx + '_'">
                <td class="option">
                    <input
                        type="text"
                        class="manualFieldName"
                        v-model="field[0]"
                        :disabled="idx > 0 && !manualStats[idx - 1][0]"
                        @blur="manualFieldBlur"/>
                </td>
                <td class="option">
                    <input
                        type="text"
                        class="manualFieldValue"
                        v-model="field[1]"
                        :disabled="!field[0]"
                        @blur="manualFieldBlur"/>
                </td>
            </tr>
        </template>
        <template v-if="!isStationAdmin">
            <tr 
                v-for="field, idx in manualStatsDisplay"
                :key="idx">
                <td class="option">{{field[0]}}</td><td class="value">{{field[1]}}</td>
            </tr>
        </template>
    </tbody>
</template>
<script>
import {mapActions, mapGetters, mapState} from 'vuex'

import request from '../request'
import {ACTION_EDIT_USER} from '../store-user'


export default {
  name: 'ManualStats',
  data () {
    return {
      manualStats: [[null, null], [null, null], [null, null], [null, null], [null, null]]
    }
  },
  mounted () {
    this.update()
  },
  computed: {
    ...mapState(['stationSettings']),
    ...mapGetters(['isStationAdmin']),
    manualStatsDisplay () {
      return this.isStationAdmin ? null : this.manualStats.filter(field => field[0])
    }
  },
  methods: {
    ...mapActions([ACTION_EDIT_USER]),
    manualFieldBlur () {
      this[ACTION_EDIT_USER]({manualStats: this.manualStats})
    },
    update () {
      if (this.stationSettings.station) {
        request.getJSON('manualStats', this.stationSettings.station.callsign)
          .then(response => {
            if (Array.isArray(response.data)) {
              this.manualStats = response.data
            }
          })
      }
    }
  },
  watch: {
    stationSettings () {
      this.update()
    }
  }
}
</script>

<style scoped>
</style>
