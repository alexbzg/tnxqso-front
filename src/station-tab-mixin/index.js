export default {
  created: function () {
    this.service = this.$parent.$data.tabs[this.tabId].service
    this.service.onUpdate( this.serviceUpdate )
  },
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      vm.tabRead()
      vm.active = true
    } )
  },
  beforeRouteLeave ( to, from, next ) {
    this.active = false
    next()
  },
  methods: {
    mixinServiceUpdate: function () {
      if ( this.active ) {
        this.tabRead()
      }
    },
    serviceUpdate: function () {
      this.mixinServiceUpdate()
    },
    tabRead: function () {
      this.$parent.tabRead( this.tabId )
    }
  }
}
