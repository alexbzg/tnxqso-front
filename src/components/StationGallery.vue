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
        	<textarea type="text" id="caption"></textarea><br/>
        	<input type="button" id="upload_file" value="Загрузить в Gallery" 
                :disabled="posting || !upload.file" @click="uploadPost"/>
        </div>

        <div class="media" v-for="(item, idx) in serviceData">
        	<img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click="deleteItem(item.id)"/>
            <img :src="item.thumb" />
            <div class="caption">{{item.caption}}</div>
        </div>
    </div>
</template>

<script>
import {mapActions, mapState} from 'vuex'

import ServiceDisplay from './ServiceDisplay'

import {ACTION_POST} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {isAdmin} from '../store-station'

export default {
  extends: ServiceDisplay,
  name: 'StationGallery',
  data () {
    return {
      showUpload: true,
      upload: {
        file: null,
        fileName: null,
        caption: null
      },
      posting: false
    }
  },
  computed: {
    ...mapState(['stationSettings']),
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
    serverPost (data) {
      this.posting = true
      data.station = this.service.station
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
      if ((this.stationSettings && this.stationSettings.skipConfirmation.galleryDelete) ||
        confirm('Удалить изображение или видео? Do you really want to delete this image or video?')) {
        this.serverPost({delete: id})
      }
    }
  }
}
</script>

<style scoped>
</style>
