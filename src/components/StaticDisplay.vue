<template>
    <div v-html="contents">
    </div>
</template>

<script>

import request from '../request'


export default {
  name: 'StaticDisplay',
  props: ['url'],
  data () {
    return {
      contents: '',
    }
  },
  async mounted () {
    this.contents = (await request.get(this.url)).data
  }
}
</script>

<style scoped>
</style>
