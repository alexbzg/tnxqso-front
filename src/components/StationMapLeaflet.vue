<template>
    <div id="map">
    <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
      <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center" :options="{zoomControl: false}"
        @update:zoom="updateZoom">
        <l-tile-layer :url="url"></l-tile-layer>
        <l-control-layers/>
        <l-wms-tile-layer
            v-for="(layer, idx) in layers"
            :key="idx"
            base-url="https://r1cf.ru/geoserver/cite/wms?"
            :layers="layer.layers"
            :name="layer.name"
            layer-type="overlay"
            :transparent="true"
            format="image/png"
            version="1.3.0"
            :styles="layer.styles"
            :visible="layer.visible"
            :options="{minZoom: layer.minZoom, maxZoom: layer.maxZoom}"
            />
      </l-map>
    </div>
</template>

<script>
import {CURRENT_POSITION_ICONS_SIZE, CURRENT_POSITION_ICONS_OFFSET} from '../constants'

import trackService from '../track-service'
const currentMarkerOptions = { preset: 'islands#dotIcon', iconColor: '#ff0000' }

import {LMap, LTileLayer, LWMSTileLayer, LControlLayers} from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'StationMap',
  props: ['statusService', 'stationSettings'],
  components: {LMap, LTileLayer, 'l-wms-tile-layer': LWMSTileLayer, LControlLayers},
  data () {
    return {
      tabId: 'news',
      currentLocation: null,
      data: {},
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      zoom: 8,
      center: [45, 45],
      layers: [
        {
          name: 'RDA',
          layers: 'RDA_FULL',
          styles: 'rda',
          visible: true,
          minZoom: 5
        },
        {
          name: 'Locator',
          layers: 'GRID576F',
          styles: 'line',
          visible: true,
          minZoom: 11
        },
        {
          name: 'Locator',
          layers: 'GRID',
          styles: 'line',
          visible: true,
          maxZoom: 10
        },
        {
          name: 'Locator QTH',
          layers: 'QTH',
          styles: 'QTH',
          visible: true,
          minZoom: 11
        },
        {
          name: 'RAFA',
          layers: 'AOPAF',
          styles: 'rafa',
          visible: true,
          minZomm: 8
        }
      ]
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
    updateZoom (zoom) {
      this.zoom = zoom
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
