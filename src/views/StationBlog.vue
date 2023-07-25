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
            @click="openEntry(item)">
            <img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click.stop="deleteItem(item.id)"/>

            <template v-if="item.file">
                <img class="icon_video" src="/static/images/icon_video.png" width='80'
                    v-if="item.file_type === 'video'"/>

                <img :src="stationPath + item.file_thumb"/>

            </template>

            <div class="gradient">&nbsp;</div>
            <div class="post_info" v-if="item.post_datetime">
              <img  class="post_comments" src="/static/images/icon_comment.png"/>
              <img class="post_like" src="/static/images/icon_post_like.png"/>
              <span class="post_like_number">15</span>
              <span class="post_date">{{item.post_datetime}}</span>
            </div>
            <div class="caption">{{item.txt}}</div>
        </div>


        <blog-entry
            v-if="activeEntry != null"
            :entry="activeEntry"
            :navigation-controls="entryNavigationControls"
            @close="closeEntry"
            @navigate="entryNavigation"
        />
    </div>
</template>

<script>
import {mapActions, mapState, mapGetters} from 'vuex'

import ServiceDisplay from './ServiceDisplay'
import BlogEntry from '../components/BlogEntry'

import {ACTION_REQUEST} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {stationPath, isAdmin} from '../store-station'

export default {
  extends: ServiceDisplay,
  components: {BlogEntry},
  name: 'StationBlog',
  data () {
    return {
      showUpload: false,
      lbIndex: 0,
      upload: {
        file: null,
        caption: null
      },
      posting: false,
      activeEntry: null
    }
  },
  computed: {
    ...mapState({
      skipConfirmation: state => state.user.user.settings.skipConfirmation,
      stationAdmin: state => state.stationSettings.admin
    }),
    ...mapGetters(['stationCallsign']),
    stationPath,
    isAdmin,
    entryNavigationControls () {
      const r = [0, 0]
      if (this.activeEntry) {
        const idx = this.serviceData.indexOf(this.activeEntry)
        r[0] = idx > 0
        r[1] = idx < this.serviceData.length - 1
      }
      return r
    }
  },
  methods: {
    ...mapActions([ACTION_REQUEST, ACTION_UPDATE_SERVICE]),
    openEntry (item) {
      this.activeEntry = item
    },
    closeEntry () {
      this.activeEntry = null
    },
    entryNavigation (shift) {
      const idx = this.serviceData.indexOf(this.activeEntry) + shift
      if (idx > -1 && idx < this.serviceData.length)
        this.activeEntry = this.serviceData[idx]

    },
    uploadFileChange () {
      this.upload.file = this.$refs.fileInput.files[0]
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