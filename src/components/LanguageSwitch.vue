<template>
    <div id="lng_block">
      <span @click="switchLanguage('en')">EN</span> <span @click="switchLanguage('ru')">RU</span>
    </div>
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
