<template>
    <div id="map">
    <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
      <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center" :options="{zoomControl: false}">
        <l-tile-layer :url="url"></l-tile-layer>
      </l-map>
    </div>
</template>

<script>
import {CURRENT_POSITION_ICONS_SIZE, CURRENT_POSITION_ICONS_OFFSET} from '../constants'

import trackService from '../track-service'
const currentMarkerOptions = { preset: 'islands#dotIcon', iconColor: '#ff0000' }

import {LMap} from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'StationMap',
  props: ['statusService', 'stationSettings'],
  components: {LMap},
  data () {
    return {
      tabId: 'news',
      currentLocation: null,
      data: {},
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 8,
      center: [47.313220, -1.319482]
    }
  },
  created () {
    const vm = this
    trackService.load()
      .then( function () {
        vm.trackVersion = trackService.data.version
        vm.trackFile = trackService.data.file
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
        const trackURL = l.protocol + '//' + l.host + '/static/stations' + l.pathname + '/' +
          vm.trackFile + '?version=' + vm.trackVersion
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
        if (dt.comments) {
          balloon += '<br/> ' + dt.comments
        }
        let options = currentMarkerOptions
        if (this.stationSettings && this.stationSettings.currentPositionIcon !== 0) {
          options = { iconImageHref: '/static/images/icon_map_' +
            this.stationSettings.currentPositionIcon + '.png',
            iconLayout: 'default#image',
            iconImageSize: CURRENT_POSITION_ICONS_SIZE,
            iconImageOffset: CURRENT_POSITION_ICONS_OFFSET
          }
        }
        if (this.currentMarker) {
          this.currentMarker.geometry.setCoordinates( dt.location )
          this.currentMarker.properties.set( {balloonContent: balloon} )
          this.currentMarker.options.set( options )
        } else {
          this.currentMarker = new global.ymaps.Placemark( dt.location,
            { balloonContent: balloon }, options )
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
