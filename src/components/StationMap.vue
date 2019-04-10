<template>
    <div id="map">
    <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
      <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center"
        :options="{zoomControl: false, attributionControl: false}">
        <l-tile-layer :url="url"></l-tile-layer>
        <l-control-attribution prefix="Powered by <a href='https://r1cf.ru/rdaloc/' target='_blank' rel='noopener'>
            R1CF RDA/RAFA maps</a>" position="bottomright"/>
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
        <l-geo-json v-if="track" :geojson="track"></l-geo-json>
        <l-marker :lat-lng="currentLocation" v-if="stationSettings && currentLocation">
            <l-icon                 
                :icon-url="'/static/images/icon_map_' + stationSettings.currentPositionIcon + '.png'"
                :icon-size="[56, 56]"
                :icon-anchor="stationSettings.currentPositionIcon ? [28, 28] : [28, 56]"
            />
            <l-popup>
                {{currentPopup.dateTime}}
                <span v-if="currentPopup.speed"><br>{{currentPopup.speed}}</span>
                <span v-if="currentPopup.comments"><br>{{currentPopup.comments}}</span>
            </l-popup>
        </l-marker>
      </l-map>
    </div>
</template>

<script>
import {LMap, LTileLayer, LWMSTileLayer, LControlLayers, LGeoJson, LMarker, LIcon, LPopup, LControlAttribution} from 'vue2-leaflet'
import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'
// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

import toGeoJson from '@mapbox/togeojson'

import trackService from '../track-service'
import request from '../request'
// const currentMarkerOptions = { preset: 'islands#dotIcon', iconColor: '#ff0000' }

export default {
  name: 'StationMap',
  props: ['statusService', 'stationSettings'],
  components: {
    LMap,
    LTileLayer,
    'l-wms-tile-layer': LWMSTileLayer,
    LControlLayers,
    LGeoJson,
    LMarker,
    LIcon,
    LPopup,
    LControlAttribution
  },
  data () {
    return {
      tabId: 'news',
      currentLocation: null,
      currentPopup: {
        dateTime: null,
        speed: null,
        comments: null
      },
      data: {},
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      track: null,
      zoom: 8,
      center: [60, 60],
      map: null,
      layers: [
        {
          name: 'RDA',
          layers: 'RDA_FULL',
          styles: 'rda',
          visible: true,
          minZoom: 5
        },
        {
          name: 'RAFA',
          layers: 'AOPAF',
          styles: 'rafa',
          visible: true,
          minZomm: 8
        },
        {
          name: 'Locator',
          layers: 'QTH,GRID576F',
          styles: 'QTH,line',
          visible: true,
          minZoom: 11
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
    showTrack () {
      const vm = this
      if (vm.trackVersion) {
        request.get('/static/stations' + window.location.pathname + '/' +
          vm.trackFile + '?version=' + vm.trackVersion)
          .then(response => {
            const trackDOM = new DOMParser().parseFromString(response.data, 'application/xml')
            if (response.data.includes('kml')) {
              this.track = toGeoJson.kml(trackDOM)
            } else {
              this.track = toGeoJson.gpx(trackDOM)
            }
          })
      }
    },
    updateLocation () {
      if (this.statusService.data && this.statusService.data.location) {
        const dt = this.statusService.data
        this.currentLocation = dt.location
        this.center = dt.location
        this.currentPopup.dateTime = dt.date + ' ' + dt.time
        this.currentPopup.speed = dt.speed ? 'speed: ' + dt.speed.toFixed( 1 ) + ' km/h' : null
        this.currentPopup.comments = dt.comments ? dt.comments : null
      }
    }
  }
}
</script>

<style scoped>
</style>
