<template>
    <change-password :token="token"></change-password>
</template>

<script>
import ChangePassword from '../components/ChangePassword'

export default {
  name: 'changePasswordView',
  components: {ChangePassword},
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      if (!vm.token) {
        vm.$router.push( '/login' )
      }
    })
  },
  data () {
    return {
      token: this.$route.query.token
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
