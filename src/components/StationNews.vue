<template>
    <div id="news">
        <div v-for="item in data" @mouseover="itemMouseOver(true,$event)" 
             @mouseout="itemMouseOver(false,$event)">
            <div class="date" :class="{new: item.new}">{{item.time}}</div>
            <div class="info" v-html="item.text" :class="{new: item.new}"></div>               
            <img class="delete_btn" src="/static/images/delete.png" 
                title="Delete this entry" @click="deleteItem( item.ts )"/>
        </div>
    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
export default {
  mixins: [tabMixin],
  props: ['stationSettings', 'user'],
  name: 'StationNews',
  data () {
    return {
      tabId: 'news'
    }
  },
  methods: {
    itemMouseOver ( state, e ) {
      if ( this.user.callsign === this.stationSettings.admin ) {
        if (state) {
          e.currentTarget.classList.add( 'can_delete' )
        } else {
          e.currentTarget.classList.remove( 'can_delete' )
        }
      }
    },
    deleteItem ( ts ) {
      if (window.confirm('Do you really want to delete this news item?')) {
        const vm = this
        return this.user.serverPost( 'news', { 'delete': ts } )
            .then( function () { vm.service.load() } )
      }
    }
  }
}
</script>

<style scoped>
</style>
