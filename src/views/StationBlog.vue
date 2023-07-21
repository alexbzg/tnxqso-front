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
                    v-if="item.file_type === 'video'"/>

                <img :src="stationPath + item.file_thumb"/>

            </template>

            <div class="date" v-if="item.post_datetime">{{item.post_datetime}}</div>
            <div class="caption">{{item.txt}}</div>
        </div>


        <Modal 
            v-if="activePost != null"
            @close="closeModal()"
        >
            <template v-slot:body>
                <template v-if="activePost.file_type">
                    <img :src="stationPath + activePost.file" v-if="activePost.file_type === 'image'"/>
                    <video v-else controls :src="stationPath + activePost.file"/>
                </template>
                <div class="caption">{{activePost.txt}}</div>
            </template>
        </Modal>
    </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from 'vuex'

import ServiceDisplay from './ServiceDisplay'
import Modal from '../components/Modal'

import {ACTION_REQUEST} from '../store-user'
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
      stationAdmin: state => state.stationSettings.admin
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
    ...mapActions([ACTION_REQUEST, ACTION_UPDATE_SERVICE]),
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
    serverPost (data, multipart, path, method) {
      this.posting = true
      return this[ACTION_REQUEST]({
        path: `blog/${path || ''}`, 
        data, 
        multipart,
        method
        })
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
        confirm('Удалить запись?\nDo you really want to delete this post?')) {
        this.serverPost({}, false, id, 'delete')
      }
    }
  }
}
</script>

<style>
</style>
