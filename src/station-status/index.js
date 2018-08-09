import Vue from 'vue'

import {USER_FIELDS_COUNT} from '../constants'

const STATUS_FIELDS = [ 'rda', 'rafa', 'wff', 'loc', 'comments' ]
const STATUS_ARRAY_FIELDS = [ 'userFields', 'location' ]
const STATUS_BOOL_FIELDS = [ 'online' ]

export default class {

  constructor () {
    this.rda = null
    this.rafa = null
    this.wff = null
    this.loc = null
    this.userFields = []
    for (let n = 0; n < USER_FIELDS_COUNT; n++) {
      this.userFields.push( null )
    }
  }

  update (data) {
    if (Object.keys(data).length !== 0) {
      STATUS_FIELDS.forEach( f => {
        Vue.set( this, f, data[f] )
      })
      STATUS_ARRAY_FIELDS.forEach( f => {
        if ( f in data ) {
          Vue.set( this, f, data[f] )
        } else {
          const l = this[f].length
          for ( let c = 0; c < l; c++ ) {
            Vue.set( this[f], c, null )
          }
        }
      })
      STATUS_BOOL_FIELDS.forEach( f => {
        this[f] = Boolean( data[f] )
      })
    }
  }
}
