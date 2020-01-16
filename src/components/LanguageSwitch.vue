<template>
    <span>
      <img class="button_lng" src="/static/images/icon_eng.png" title="English"
        @click="switchLanguage('en')"/>
      <img class="button_lng" src="/static/images/icon_rus.png" title="Русский"
        @click="switchLanguage('ru')"/>
    </span>
</template>

<script>
import {mapMutations} from 'vuex'

import {MUTATE_LANGUAGE} from '../store-language'

export default {
  name: 'LanguageSwitch',
  data () {
    return {}
  },
  methods: {
    ...mapMutations([MUTATE_LANGUAGE]),
    switchLanguage (val) {
      this[MUTATE_LANGUAGE](val)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
