<template>
    <div id="tnxlog" v-html="getString('TNXLOG')"></div>
</template>

<script>
import LocalizationMixin from '../localization-mixin'

export default {
  name: 'tnxlog',
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
