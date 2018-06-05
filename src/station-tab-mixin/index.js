export default {
  data () {
    return {
      data: []
    }
  },
  created () {
    this.service = this.$parent.$data.tabs[this.tabId].service
    this.service.onUpdate( this.serviceUpdate )
    this.tsRead = null
  },
  beforeRouteEnter ( to, from, next ) {
    next( vm => {
      vm.tabRead()
      vm.active = true
      vm.scheduleRemoveNew()
    } )
  },
  beforeRouteLeave ( to, from, next ) {
    this.active = false
    this.$parent.tabRead( null )
    next()
  },
  methods: {
    mixinServiceUpdate () {
      this.data = this.service.data
      if ( this.active ) {
        this.tabRead()
        this.scheduleRemoveNew()
      }
      const dataLength = this.data.length
      if (dataLength > 0 ) {
        if (this.tsRead) {
          for (let c = 0; c < dataLength; c++) {
            if (this.data[c].ts > this.tsRead) {
              this.$set( this.data, c, { ...this.data[c], new: true } )
            } else {
              break
            }
          }
        }
        this.tsRead = this.data[0].ts
      }
    },
    serviceUpdate () {
      this.mixinServiceUpdate()
    },
    tabRead () {
      this.$parent.tabRead( this.tabId )
    },
    scheduleRemoveNew () {
      if ( this.data && this.data.length > 0 ) {
        const ts = this.data[0].ts
        setTimeout( () => {
          const dataLength = this.data.length
          for ( let c = 0; c < dataLength && this.data[c].new; c++ ) {
            if ( this.data[c].ts <= ts ) {
              this.$set( this.data, c, { ...this.data[c], new: false } )
            }
          }
        }, 10 * 1000 )
      }
    }
  }
}
