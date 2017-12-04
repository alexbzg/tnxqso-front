export default {
  created: function () {
    this.service = this.$parent.$data.tabs[this.tabId].service
    this.service.onUpdate( this.serviceUpdate )
    this.tsRead = null
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
      const data = this.service.data
      const dataLength = data.length
      if (dataLength > 0 ) {
        if (this.tsRead) {
          for (let c = 0; c < dataLength; c++) {
            if (data[c].ts > this.tsRead) {
              data[c].new = true
            } else {
              break
            }
          }
        }
        this.tsRead = data[0].ts
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
