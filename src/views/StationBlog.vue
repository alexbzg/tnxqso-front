<template>
    <div id="blog">
        <div id="add_image" v-if="isAdmin" @click="showUpload = !showUpload">
            <img src="/static/images/icon_add_image.png" title="New message" />
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

        <div class="media" v-for="(item, idx) in serviceData" :key="idx"
            @click="openModal(item)">
            <img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click.stop="deleteItem(item.id)"/>

            <template v-if="item.file">
                <img class="icon_video" src="/static/images/icon_video.png" width='80'
                    v-if="item.type === 'video'"/>

                <img :src="stationPath + item.thumb"/>

            </template>

            <div class="date" v-if="item.datetime">{{item.datetime}}</div>
            <div class="caption">{{item.caption}}</div>
        </div>


        <Modal 
            v-if="activePost != null"
            @close="closeModal()"
        >
            <template v-slot:body>
                <template v-if="activePost.type">
                    <img :src="stationPath + activePost.file" v-if="activePost.type === 'image'"/>
                    <video v-else controls :src="stationPath + activePost.file" :width="activePost.width"/>
                </template>
                <div class="caption">{{activePost.caption}}</div>
            </template>
        </Modal>
    </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from 'vuex'

import ServiceDisplay from './ServiceDisplay'
import Modal from '../components/Modal'

import {ACTION_POST} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {isAdmin} from '../store-station'
import {urlCallsign} from '../utils'

export default {
  extends: ServiceDisplay,
  components: {Modal},
  name: 'StationGallery',
  data () {
    return {
      showUpload: false,
      lbIndex: 0,
      upload: {
        file: null,
        caption: null
      },
      posting: false,
      activePost: null
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
    isAdmin () {
      return isAdmin()
    }
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_UPDATE_SERVICE]),
    openModal (item) {
      this.activePost = item
      document.body.classList.add('modal-open')
    },
    closeModal () {
      this.activePost = null
      document.body.classList.remove('modal-open')
    },
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
          this.showUpload = false
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
