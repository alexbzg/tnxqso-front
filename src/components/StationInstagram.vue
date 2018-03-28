<template>
    <div id="instagram">
        <a v-for="image in data" :href="'https://www.instagram.com/p/' + image.id"
            target="_blank" rel="noopener">
            <img :src="image.thumb"/>
        </a>
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'

export default {
  name: 'StationInstagram',
  mixins: [tabMixin],
  data () {
    return {
      tabId: 'inst'
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
</style>
