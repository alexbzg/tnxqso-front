<template>
    <div id="map">
    <div id="refresh_time">Auto refresh<br/><b>1 min</b></div>
      <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center"
        :bounds="bounds"
        :options="{zoomControl: false, attributionControl: false}">
        <l-control-layers :hide-single-base="true"/>
        <l-tile-layer v-for="layer in baseLayers" :key="layer.id" :url="url" :options="{id: layer.id}"
            layer-type="base" :name="layer.name" :visible="layer.visible"/>
        <l-control-attribution prefix="Powered by <a href='https://r1cf.ru/rdaloc/' target='_blank' rel='noopener'>
        R1CF RDA/RAFA maps</a>, <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>" position="bottomright"/>
        <l-wms-tile-layer
            v-for="(layer, idx) in overlays"
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
        <l-geo-json :geojson="track" ref="geoJsonTrack"></l-geo-json>
        <l-marker :lat-lng="currentLocation" v-if="stationSettings && currentLocation">
            <l-icon
                :icon-url="'/static/images/icon_map_' + stationSettings.currentPositionIcon + '.png'"
                :icon-size="[56, 56]"
                :icon-anchor="stationSettings.currentPositionIcon ? [28, 28] : [28, 56]"
            />
            <l-popup>
                {{currentPopup.dateTime}}
                <span v-if="currentPopup.speed"><br>{{currentPopup.speed}}</span>
                <span v-if="currentPopup.comments"><br>{{currentPopup.comments}}</span><br/>
                <a v-if="currentLocation" :href="'https://yandex.ru/maps/?ll=' +
                    currentLocation[1] + '%2C' + currentLocation[0] + '&pt=' +
                    currentLocation[1] + '%2C' + currentLocation[0] + '&z=' + zoom +
                    '&l=map'" target="_blank" rel="noopener">
                    Yandex maps
                </a>
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

const DEFAULT_ZOOM = 13

export default {
  name: 'StationMap',
  props: ['statusData', 'stationSettings'],
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
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      baseLayers: [
        {
          id: '',
          name: 'Map',
          visible: true
        }
      ],
      track: null,
      zoom: DEFAULT_ZOOM,
      center: [60, 60],
      bounds: null,
      map: null,
      overlays: [
        {
          name: 'RDA',
          layers: 'RDA_2020',
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
  mounted () {
    trackService.load()
      .then(() => {
        this.trackVersion = trackService.data.version
        this.trackFile = trackService.data.file
        this.showTrack()
      })
    this.updateLocation()
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
              vm.track = toGeoJson.kml(trackDOM)
            } else {
              vm.track = toGeoJson.gpx(trackDOM)
            }
            if (!vm.currentLocation && vm.track) {
              vm.$nextTick(() => {
                vm.bounds = vm.$refs.geoJsonTrack.getBounds()
              })
            }
          })
      }
    },
    updateLocation () {
      if (this.statusData && this.statusData.location) {
        const dt = this.statusData
        if (!this.currentLocation) {
          this.zoom = DEFAULT_ZOOM
        }
        this.currentLocation = dt.location
        this.bounds = null
        this.center = dt.location
        this.currentPopup.dateTime = dt.date + ' ' + dt.time
        this.currentPopup.speed = dt.speed ? 'speed: ' + dt.speed.toFixed( 1 ) + ' km/h' : null
        this.currentPopup.comments = dt.comments ? dt.comments : null
      }
    }
  },
  watch: {
    statusData () {
      this.updateLocation()
    }
  }
}
</script>

<style scoped>
</style>
