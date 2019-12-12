<template>
    <div id="gallery">
        <div id="add_image" v-if="isAdmin" @click="showUpload = !showUpload">
        		<img src="/static/images/icon_add_image.png" width='50' />
        </div>

        <div class="media media_upload_form" v-show="isAdmin && showUpload">
            <input type="file" @change="uploadFileChange" style="display:none"
                id="upload_file"
                ref="fileInput" />

            <label for="upload_file" id="select_file">Выбрать файл</label><br/>
            <div id="selected_filename">{{upload.fileName}}</div>
        	Подпись к файлу<br/>
        	<textarea type="text" id="caption" v-model="upload.caption"></textarea><br/>
        	<input type="button" id="upload_file" value="Загрузить в Gallery"
                :disabled="posting || !upload.file" @click="uploadPost"/>
        </div>

        <div class="media" v-for="(item, idx) in serviceData">
            <img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click="deleteItem(item.id)"/>

			<img class="icon_video" src="/static/images/icon_video.png" width='80' 
                v-if="item.type === 'video'"  @click="openLightbox(idx)"/>

            <img :src="stationPath + item.thumb" @click="openLightbox(idx)"/>

            <div class="caption">{{item.caption}}</div>
        </div>

        <vue-pure-lightbox :images="lbImages" :open-at-index="lbIndex" ref="lb">
            <template v-slot:loader>Loading…</template>
            <template v-slot:content="{url: {link, alt, type, width}}">
                <img :src="link" :alt="alt" v-if="type === 'image'"/>
                <video v-else controls :src="link" :width="width"/>
            </template>
        </vue-pure-lightbox>
    </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'

import VuePureLightbox from 'vue-pure-lightbox'
import 'vue-pure-lightbox/dist/VuePureLightbox.css'

import ServiceDisplay from './ServiceDisplay'

import {ACTION_POST} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {isAdmin} from '../store-station'
import {urlCallsign} from '../utils'

export default {
  extends: ServiceDisplay,
  components: {VuePureLightbox},
  name: 'StationGallery',
  data () {
    return {
      showUpload: false,
      lbIndex: 0,
      upload: {
        file: null,
        fileName: null,
        caption: null
      },
      posting: false
    }
  },
  computed: {
    ...mapState({
      skipConfirmation: state => state.user.user.settings.skipConfirmation,
      stationCallsign: state => state.stationSettings.station.callsign
    }),
    stationPath () {
      return '/static/stations/' + urlCallsign(this.stationCallsign) + '/'
    },
    lbImages () {
      return this.serviceData.map(x => {
        return {
          link: this.stationPath + x.file,
          alt: x.caption,
          type: x.type,
          width: x.type === 'video' ? x.width : null
        }
      })
    },
    isAdmin () {
      return isAdmin()
    }
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_UPDATE_SERVICE]),
    uploadFileChange (e) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }
      const reader = new FileReader()
      this.upload.fileName = files[0].name

      reader.onload = e => {
        this.upload.file = e.target.result
      }
      reader.readAsDataURL(files[0])
    },
    openLightbox (idx) {
      this.lbIndex = idx
      this.$nextTick(() => { this.$refs.lb.show() })
    },
    serverPost (data) {
      this.posting = true
      return this[ACTION_POST]({path: 'gallery', data: data})
        .then(() => { this[ACTION_UPDATE_SERVICE](this.serviceName) })
        .finally(() => { this.posting = false })
    },
    uploadPost () {
      this.serverPost(this.upload)
        .then(() => {
          this.upload.file = null
          this.upload.fileName = null
        })
    },
    deleteItem (id) {
      if (this.skipConfirmation.galleryDelete ||
        confirm('Удалить изображение или видео?\nDo you really want to delete this image or video?')) {
        this.serverPost({delete: id})
      }
    }
  }
}
</script>

<style>
</style>
