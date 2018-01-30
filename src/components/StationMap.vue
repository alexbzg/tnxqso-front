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
const currentMarkerOptions = { preset: 'islands#dotIcon', iconColor: '#ff0000' }

export default {
  name: 'StationMap',
  props: ['statusService'],
  components: { yandexMap, ymapMarker },
  data () {
    return {
      tabId: 'news',
      currentLocation: null,
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
    this.statusService.onUpdate( this.updateLocation )
  },
  methods: {
    mapInit (map) {
      this.map = map
      this.showTrack()
      this.updateLocation()
    },
    showTrack () {
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
    },
    updateLocation () {
      if (this.statusService.data.location && this.map) {
        const dt = this.statusService.data
        let balloon = dt.date + ' ' + dt.time
        if ( dt.speed ) {
          balloon += '<br/> speed: ' + dt.speed.toFixed( 1 ) + ' km/h'
        }
        if (this.currentMarker) {
          this.currentMarker.geometry.setCoordinates( dt.location )
          this.currentMarker.properties.set( {balloonContent: balloon} )
        } else {
          this.currentMarker = new global.ymaps.Placemark( dt.location,
            { balloonContent: balloon },
            currentMarkerOptions )
          this.map.geoObjects.add( this.currentMarker )
        }
        this.map.setCenter( dt.location )
      } else if (this.map && this.currentMarker) {
        this.map.geoObjects.remove( this.curretnMarker )
        this.currentMarker = null
      }
    }
  }
}
</script>

<style scoped>
</style>
