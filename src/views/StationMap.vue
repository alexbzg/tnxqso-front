<template>
    <div id="map">
      <l-map
        style="height: 100%; width: 100%"
        ref="map"
        :zoom="map_settings.zoom"
        :center.sync="center"
        :bounds="bounds"
        :options="{zoomControl: false, attributionControl: false}"
        @ready="map_ready"
        @update:zoom="update_zoom"
        >
        <l-control-layers :hide-single-base="true"/>
        <l-tile-layer v-for="layer in baseLayers" :key="layer.id" :url="url" :options="{id: layer.id}"
            layer-type="base" :name="layer.name" :visible="layer.visible"/>
        <l-control-attribution prefix="Powered by <a href='https://r1cf.ru/rdaloc/' target='_blank' rel='noopener'>
        R1CF RDA/RAFA maps</a>, <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>" position="bottomright"/>
        <l-wms-tile-layer
            v-for="layer in overlays"
            :key="layer.name"
            base-url="https://r1cf.ru:8088/geoserver/cite/wms?"
            :layers="layer.layers"
            :name="layer.name"
            layer-type="overlay"
            :transparent="true"
            format="image/png"
            version="1.3.0"
            :styles="layer.styles"
            :visible="overlay_visible(layer.name)"
            :options="{minZoom: layer.minZoom, maxZoom: layer.maxZoom}"
            @update:visible="update_overlay(layer.name, $event)"
            />

        <l-geo-json 
            :geojson="track" 
            ref="geoJsonTrack"
            :options="{className: 'map-geojson-track'}"
            >
        </l-geo-json>
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
                <a v-if="currentLocation" :href="'https://yandex.ru/maps/?l=sat' +
                    '&ll=' + currentLocation[1] + '%2C' + currentLocation[0] +
                    '&pt=' + currentLocation[1] + '%2C' + currentLocation[0] +
                    '&z=17'"
                    target="_blank" rel="noopener">
                    Yandex maps
                </a>
            </l-popup>
        </l-marker>
      </l-map>

      <input type="checkbox" v-model="map_settings.centerLocation" @change="updateCenterLocation"/> Center map to station

    </div>
</template>

<script>
import {mapGetters} from 'vuex'

import {LMap, LTileLayer, LWMSTileLayer, LControlLayers, LGeoJson, LMarker, LIcon, LPopup, LControlAttribution} from 'vue2-leaflet'
import {Icon} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import terminator from '@joergdietrich/leaflet.terminator'
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
import storage from '../storage'

const MAP_SETTINGS_STORAGE_KEY = 'mapSettings'

const DEFAULT_ZOOM = 13
const OVERLAYS = [
        {
          qthCountry: 'RU',
          name: 'RDA',
          layers: 'RDA_2020',
          styles: 'rda',
          visible: true,
          minZoom: 5
        },
        {
          qthCountry: 'RU',
          name: 'RAFA',
          layers: 'AOPAF',
          styles: 'rafa',
          visible: true,
          minZomm: 8
        },
        {
          qthCountry: 'RU',
          name: 'RRNA',
          layers: 'RRNA_LIST',
          styles: 'river',
          visible: true,
          minZomm: 8
        },
        {
          qthCountry: 'IT',
          name: 'WAIP',
          layers: 'WAIP2',
          styles: 'waipx',
          visible: true,
          minZoom: 5
        },
        {
          name: 'Locator',
          layers: 'QTH,GRID576F',
          styles: 'QTH,line',
          visible: true,
          minZoom: 11
        },
        {
          qthCountry: 'GB',
          name: 'WAB',
          layers: 'WAB',
          styles: 'WAB2',
          visible: true,
          minZoom: 11
        }
      ]

export default {
  name: 'StationMap',
  props: ['stationSettings'],
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
    const map_settings = storage.load(MAP_SETTINGS_STORAGE_KEY, 'local') || {overlays: {}, zoom: DEFAULT_ZOOM}

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
      map_settings: map_settings,
      track: null,
      center: [60, 60],
      bounds: null,
      map: null
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
    map_ready () {
      const map = this.$refs.map.mapObject
      const t = terminator({className: 'map-terminator', opacity: 0.2, fillOpacity: 0.2})
      t.addTo(map)
      setInterval(function() {
        t.setTime()
      }, 60000)
    },
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
    overlay_visible (name) {
      if (name in this.map_settings.overlays &&
        typeof this.map_settings.overlays[name] !== 'undefined') {
        return this.map_settings.overlays[name]
      }
      return this.overlays.find(item => item.name === name).visible
    },
    centerLocation (force) {
      if (this.map_settings.centerLocation || force) {
        if (!this.currentLocation) {
          this.zoom = DEFAULT_ZOOM
        }
        this.bounds = null
        this.center = [...this.currentLocation]
      }
      storage.save(MAP_SETTINGS_STORAGE_KEY, this.map_settings, 'local' )
    },
    updateLocation () {
      if (this.statusData && this.statusData.location) {
        const dt = this.statusData
        const force = !this.currentLocation
        this.currentLocation = dt.location
        this.centerLocation(force)
        this.currentPopup.dateTime = (dt.locDate || dt.date) + ' ' + (dt.locTime || dt.time)
        this.currentPopup.speed = dt.speed ? 'speed: ' + dt.speed.toFixed( 1 ) + ' km/h' : null
        this.currentPopup.comments = dt.comments ? dt.comments : null
      }
    },
    update_zoom (zoom) {
      this.map_settings.zoom = zoom
      storage.save(MAP_SETTINGS_STORAGE_KEY, this.map_settings, 'local' )
    },
    update_overlay (overlay_name, visible) {
      this.map_settings.overlays[overlay_name] = visible
      storage.save(MAP_SETTINGS_STORAGE_KEY, this.map_settings, 'local' )
    },
    updateCenterLocation () {
      storage.save(MAP_SETTINGS_STORAGE_KEY, this.map_settings, 'local' )
      if (this.map_settings.centerLocation) {
        this.centerLocation()
      }
    }

  },
  computed: {
    ...mapGetters(['stationCallsign', 'statusData']),
    overlays () {
      return OVERLAYS.filter(layer =>
        !layer.qthCountry || (this.stationSettings && this.stationSettings.qthCountry === layer.qthCountry))
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
