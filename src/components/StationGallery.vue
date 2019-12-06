<template>
    <div id="gallery">
        <div id="add_image" v-if="isAdmin" @click="showUpload != showUpload">
        		<img src="/static/images/icon_add_image.png" width='50' />
        </div>

        <div class="media media_upload_form" v-show="isAdmin && showUpload">
        	<input type="button" id="select_file" value="Выбрать файл"><br/>
        	<div id="selected_filename">DCM1234_12.jpg</div>
        	Подпись к файлу<br/>
        	<textarea type="text" id="caption"></textarea><br/>
        	<input type="button" id="upload_file" value="Загрузить в Gallery">
        </div>

        <div class="media" v-for="(item, idx) in serviceData">
        	<img class="delete" src="/static/images/delete.png" width='30' v-if="isAdmin"
                @click="deleteItem"/>
            <img :src="item.thumb" />
        	<div class="caption">Подпись к фото или видео к фото или видео к фото или видео к фото или видео к фото или видео</div>
        </div>
    </div>
</template>

<script>
import {mapActions} from 'vuex'

import ServiceDisplay from './ServiceDisplay'

import {ACTION_POST} from '../store-user'
import {ACTION_UPDATE_SERVICE} from '../store-services'
import {isAdmin} from '../store-station'

export default {
  extends: ServiceDisplay,
  name: 'StationGallery',
  data () {
    return {
      showUpload: false,
      upload: {
        file: null,
        caption: null
      },
      posting: false
    }
  },
  computed: {
    isAdmin () {
      return isAdmin()
    }
  },
  methods: {
    ...mapActions([ACTION_POST, ACTION_UPDATE_SERVICE])
  }
}
</script>

<style scoped>
</style>
