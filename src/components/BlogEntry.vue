<template>
    <Modal
        @close="$emit('close')"
    >
        <template v-slot:header>
          <button
            type="button"
            class="btn-like"
          ><img src="/static/images/icon_like.png"/>
          </button>
          <span class="like">15</span>
          <span class="navigation">
            <button
              v-if="navigationControls && navigationControls[0]"  
              type="button"
              class="btn-left"
              @click="$emit('navigate', -1)"
            ><img src="/static/images/icon_left.png"/>
            </button>
            21 Jul 2023 13:42
            <button
              v-if="navigationControls && navigationControls[1]"
              type="button"
              class="btn-right"
              @click="$emit('navigate', 1)"
            ><img src="/static/images/icon_right.png"/>
            </button>
          </span>
          <button
            type="button"
            class="btn-translate"
            aria-label="Translate post"
          ><img src="/static/images/icon_translate_circle.png"/>
          </button>
        </template>

        <template v-slot:body>
            <template v-if="entry.file_type">
                <img :src="stationPath + entry.file" v-if="entry.file_type === 'image'"/>
                <video v-else controls :src="stationPath + entry.file"/>
            </template>
            <div class="caption">{{entry.txt}}</div>
        </template>
    </Modal>
</template>

<script>
import {stationPath, isAdmin} from '../store-station'

import Modal from './Modal'

export default {
  components: {Modal},
  props: ['entry', 'navigationControls'],
  name: 'BlogEntry',
  data () {
    return {
    }
  },
  methods: {
  },
  computed: {
    stationPath,
    isAdmin
  }
}
</script>


