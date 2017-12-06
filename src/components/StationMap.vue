<template>
    <div id="map">
        <yandex-map 
            :coords="[45,45]"
            zoom="5"
            style="width: 100%; height: 100%;"
            @map-was-initialized="mapInit">
        </yandex-map>
    </div>
</template>

<script>
import trackService from '../track-service'
import { yandexMap, ymapMarker } from 'vue-yandex-maps'
// import { loadScript } from '../utils'

// const ymapURL = 'https://api-maps.yandex.ru/2.1/??load=package.geoXml&lang=ru_RU'

export default {
  name: 'StationMap',
  components: { yandexMap, ymapMarker },
  data () {
    return {
      tabId: 'news',
      data: {}
    }
  },
  created () {
    const vm = this
    trackService.load()
      .then( function () {
        vm.trackVersion = trackService.data.version
        vm.showTrack()
      })
  },
  methods: {
    mapInit: function (map) {
      this.map = map
      this.showTrack()
    },
    showTrack: function () {
      const vm = this
      if (vm.map && vm.trackVersion) {
        const l = window.location
        const trackURL = l.protocol + '//' + l.host + '/static/stations' + l.pathname + '/track.xml?version=' +
          vm.trackVersion
        console.log( trackURL )
        global.ymaps.geoXml.load(trackURL)
          .then( function (res) {
            vm.map.geoObjects.add(res.geoObjects)
          }, function (err) {
            console.log('Ошибка: ' )
            console.log( err )
          })
      }
    }
  }
}
</script>

<style scoped>
</style>
