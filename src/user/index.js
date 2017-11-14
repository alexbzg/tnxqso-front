import storage from '../storage'
import request from '../request'
import router from '../router'

var _user = {}

function fromStorage () {
  _user = storage.load( 'user' )
  if ( !_user ) {
    _user = {}
  }
  userInit()
}

function userInit () {
  if ( !_user.settings ) {
    _user.settings = {}
  }
  if ( !_user.settings.enable ) {
    _user.settings.enable = {}
  }
  if ( !_user.settings.station ) {
    _user.settings.station = {}
  }
}

function toStorage () {
  storage.save( 'user', _user, _user.remember ? 'local' : 'session' )
}

fromStorage()

export default {

  login ( data, remember ) {
    var user = this
    return request.post( 'login', data )
      .then( function ( response ) {
        _user = response.data
        _user.remember = remember
        toStorage()
        user.loggedIn = true
        router.push( '/profile' )
        userInit()
      })
  },

  loggedIn: Boolean( _user.token ),

  logout () {
    storage.remove( 'user', 'local' )
    storage.remove( 'user', 'session' )
    _user = {}
    this.loggedIn = false
    router.push( '/login' )
  },

  settings () {
    return JSON.parse( JSON.stringify( _user.settings ) )
  },

  saveSettings ( settings ) {
    _user.settings = JSON.parse( JSON.stringify( settings ) )
    toStorage()
  }

}
