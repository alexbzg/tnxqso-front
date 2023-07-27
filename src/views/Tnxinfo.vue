<template>
    <div id="qthnow" v-html="getString('TNXINFO')"></div>
</template>

<script>
import LocalizationMixin from '../localization-mixin'
export default {
  name: 'tnxview',
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
