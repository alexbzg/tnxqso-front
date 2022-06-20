<template>
    <div id="qthnow" v-html="getString('TNXPOST')"></div>
</template>

<script>
import LocalizationMixin from '../localization-mixin'
export default {
  name: 'tnxpost',
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
