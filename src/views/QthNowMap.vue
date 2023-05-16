<template>
    <div id="map">
      <l-map style="height: 100%; width: 100%" :zoom="zoom" :center.sync="center"
        :bounds="bounds"
        @ready="map_ready"
        ref="map"
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
        <l-circle-marker v-for="(item, idx) in locations" :lat-lng="item.location" :key="'location_' + idx"
            :radius="5" color="red">
            <l-tooltip :options="{permanent: true, className: 'tooltip'}">
               <b>{{item.callsign}}</b> {{item.time}}
            </l-tooltip>
            <l-popup>
                <a :href="'https://yandex.ru/maps/?ll=' + item.location[1] + '%2C' + item.location[0] + '&pt=' +
                        item.location[1] + '%2C' + item.location[0] + '&z=' + zoom +
                        '&l=map'" target="_blank" rel="noopener">
                        Yandex maps
                </a>
            </l-popup>
        </l-circle-marker>
      </l-map>
	<span class="map_comments">Last 10 minutes data - Данные за последние 10 минут.</span>

    </div>
</template>

<script>

import {LMap, LTileLayer, LWMSTileLayer, LControlLayers, LCircleMarker, LTooltip, LPopup, LControlAttribution} from 'vue2-leaflet'
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

import dataServiceFactory from '../data-service-factory'

const DEFAULT_ZOOM = 5
const LOCATIONS_RELOAD_INTERVAL = 10000

export default {
  name: 'QthNowMap',
  props: ['secret'],
  components: {
    LMap,
    LTileLayer,
    'l-wms-tile-layer': LWMSTileLayer,
    LControlLayers,
    LCircleMarker,
    LTooltip,
    LPopup,
    LControlAttribution
  },
  data () {
    return {
      locations: [],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      baseLayers: [
        {
          id: '',
          name: 'Map',
          visible: true
        }
      ],
      zoom: DEFAULT_ZOOM,
      center: [55, 50],
      bounds: null,
      map: null,
      centerLocationFlag: true,
      overlays: [
        {
          qthCountry: 'RU',
          name: 'RDA',
          layers: 'RDA_2020',
          styles: 'rda',
          visible: false,
          minZoom: 5
        },
        {
          qthCountry: 'RU',
          name: 'RAFA',
          layers: 'AOPAF',
          styles: 'rafa',
          visible: false,
          minZomm: 8
        },
        {
          qthCountry: 'IT',
          name: 'WAIP',
          layers: 'WAIP2',
          styles: 'waipx',
          visible: false,
          minZoom: 5
        },
        {
          qthCountry: 'GB',
          name: 'WAB',
          layers: 'WAB',
          styles: 'WAB2',
          visible: false,
          minZoom: 11
        },
        {
          name: 'Locator',
          layers: 'QTH,GRID576F',
          styles: 'QTH,line',
          visible: false,
          minZoom: 11
        }
      ]
    }
  },
  beforeRouteEnter (to, from, next) {
    next( vm => {
      if (vm.secret && !vm.$store.getters.siteAdmin)
        vm.$router.push('/qthnowmap')
    })
  },
  mounted () {
    this.service = dataServiceFactory()
    this.service.url = this.serviceUrl
    this.service.eventName = 'qth-now-locations-change'
    this.service.onUpdate(() => { this.updateLocations() })
    this.hndls = []
    this.service.load()
    this.hndls.push(setInterval(this.service.load, LOCATIONS_RELOAD_INTERVAL))
  },
  beforeDestroy () {
    for (const hndl of this.hndls) {
      clearInterval(hndl)
    }
  },
  methods: {
    updateLocations () {
      this.locations = this.service.data
    },
    map_ready () {
      const map = this.$refs.map.mapObject
      const t = terminator({className: 'map-terminator', opacity: 0.2, fillOpacity: 0.2})
      t.addTo(map)
      setInterval(function() {
        t.setTime()
      }, 60000)
    },
    setServiceUrl () {
      if (this.service.url !== this.serviceUrl) {
        this.service.url = this.serviceUrl
        this.service.lastUpdated = null
        this.service.load()
      }
    }
  },
  computed: {
    serviceUrl () {
        return this.secret && this.$store.getters.siteAdmin ? 
            '/static/js/qth_now_locations_all.json' :
            '/static/js/qth_now_locations.json'
    }
  },
  watch: {
    serviceUrl () {
      this.setServiceUrl()
    }
  }
}
</script>

<style>
.tooltip {
  border: 1px solid red;
  border-radius: 10px;
}
.leaflet-tooltip-left.tooltip::before {
  border-left-color: red;
}
.leaflet-tooltip-right.tooltip::before {
  border-right-color: red;
}                
.map_comments {
  font-size: 12px;
}
</style>
