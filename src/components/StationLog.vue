<template>
    <div id="log">

        <div id="call_search">
            Callsign: 
            <input type="text" id="input_call" v-model="searchValue"> 
            <button @click="search()">Search</button>
        </div>

        <table id="search_results" v-if="searchResults && searchResults.length > 0">
          <tr>
            <td id="icon_close">
              <img src="/static/images/icon_close.png" title="Close search results"
                @click="clearSearch()">
            </td>
          </tr>
          <tr>
            <td>
              <log-table :data="searchResults"></log-table>
            </td>
          </tr>
        </table>

        <log-table :data="dataSlice"></log-table>

    </div>
</template>

<script>
import tabMixin from '../station-tab-mixin'
import LogTable from './LogTable'
import storage from '../storage'

const logSearchValueStorageKey = 'logSearchValue'

export default {
  mixins: [tabMixin],
  name: 'StationLog',
  components: { LogTable },
  data () {
    return {
      tabId: 'log',
      searchValue: storage.load( logSearchValueStorageKey, 'local' ),
      searchResults: null
    }
  },
  methods: {
    search () {
      this.searchValue = this.searchValue.toUpperCase()
      storage.save( logSearchValueStorageKey, this.searchValue, 'local' )
      this.searchResults = this.data.filter( spot => spot.cs === this.searchValue )
      if ( this.searchResults.length === 0 ) {
        window.alert( 'Nothing was found.' )
      }
    },
    clearSearch () {
      this.searchResults = null
    }
  },
  computed: {
    dataSlice () {
      return this.data ? this.data.slice( 0, 50 ) : []
    }
  }
}
</script>

<style scoped>
</style>
