import {ACTION_SERVICE_MARK_READ} from '../store-services'

export default {
  props: ['serviceName'],
  computed: {
    service () {
      return this.$store.state.services[this.serviceName]
    },
    serviceData () {
      return this.service ? this.service.data : []
    }
  },
  beforeRouteEnter ( to, from, next ) {
    next(vm => {
      vm.markServiceRead()
    })
  },
  methods: {
    markServiceRead () {
      this.$store.dispatch(ACTION_SERVICE_MARK_READ, {service: this.serviceName})
    }
  },
  watch: {
    serviceData () {
      this.markServiceRead()
    }
  }
}
