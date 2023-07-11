<template>
    <div id="gallery">
        <div id="add_image" v-if="isAdmin" @click="showUpload = !showUpload">
            <img src="/static/images/icon_add_image.png" width='50' />
        </div>

        <div class="media_upload_form" v-if="isAdmin && showUpload">
          <div id="input_file">
            <input type="file" @change="uploadFileChange" style="display:none"
                id="upload_file" ref="fileInput" />
            <label for="upload_file" id="select_file">File - Файл</label><br/>
            <div id="selected_filename">{{upload.file ? upload.file.name : "\xa0"}}</div>
          </div>
          <textarea type="text" id="caption" v-model="upload.caption"></textarea><br/>
          <input type="button" id="upload_file" value="Upload - Загрузить"
                :disabled="posting || (!upload.file && !upload.caption)" @click="uploadPost"/>
        </div>

        <div class="media" v-for="(item, idx) in serviceData" :key="idx">
            <img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click="deleteItem(item.id)"/>

            <template v-if="item.file">
                <img class="icon_video" src="/static/images/icon_video.png" width='80'
                    v-if="item.type === 'video'"  @click="openLightbox(idx)"/>

                <img :src="stationPath + item.thumb" @click="openLightbox(idx)"/>

                <div class="date" v-if="item.datetime">{{item.datetime}}</div>
            </template>

            <div class="caption">{{item.caption}}</div>
        </div>


        <vue-pure-lightbox :images="lbImages" :open-at-index="lbIndex" ref="lb">
            <template v-slot:loader>Loading…</template>
            <template v-slot:content="{url: {link, alt, type, width}}">
                <div class="imgbox">
                    <span class="helper"></span>
                    <img :src="link" :alt="alt" v-if="type === 'image'"/>
                    <video v-else controls :src="link" :width="width"/>
                </div>
            </template>
        </vue-pure-lightbox>
    </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from 'vuex'

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
        caption: null
      },
      posting: false
    }
  },
  computed: {
    ...mapState({
      skipConfirmation: state => state.user.user.settings.skipConfirmation,
    }),
    ...mapGetters(['stationCallsign']),
    stationPath () {
      return '/static/stations/' + urlCallsign(this.stationCallsign) + '/'
    },
    _lbImages () {
      return this.serviceData.map(x => {
        return this.stationPath + x.file
      })
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
    uploadFileChange () {
      this.upload.file = this.$refs.fileInput.files[0]
    },
    openLightbox (idx) {
      this.lbIndex = idx
      this.$nextTick(() => { this.$refs.lb.show() })
    },
    serverPost (data, multipart) {
      this.posting = true
      return this[ACTION_POST]({path: 'gallery', data: data, multipart: multipart})
        .then(() => { this[ACTION_UPDATE_SERVICE](this.serviceName) })
        .finally(() => { this.posting = false })
    },
    uploadPost () {
      this.serverPost(this.upload, true)
        .then(() => {
          this.upload.file = null
          this.upload.caption = null
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
.imgbox {
   width:90vw;
   height:100vh;
   white-space: nowrap;
   text-align:center;
}
.imgbox .helper {
   display: inline-block;
   height: 100%;
   vertical-align: middle;
}
.imgbox img, .imgbox video {
   max-width:100%;
   max-height:100%;
   width:auto !important;
   height:auto !important;
   vertical-align: middle;
}
</style>
