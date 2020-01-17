<template>
    <div id="about" v-html="getString('ABOUT')">
    </div>
</template>

<script>
import LocalizationMixin from '../localization-mixin'

export default {
  name: 'about',
  mixins: [LocalizationMixin],
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
