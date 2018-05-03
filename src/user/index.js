import storage from '../storage'
import request from '../request'
import router from '../router'
import Vue from 'vue'

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
        userInit()
        user.update()
        router.push( '/profile' )
      })
  },

  update () {
    Vue.set( this, 'loggedIn', Boolean( _user.token ) )
    Vue.set( this, 'callsign', _user.callsign )
    Vue.set( this, 'stationCallsign', _user.settings.station.callsign !== ''
      ? _user.settings.station.callsign : false )
    Vue.set( this, 'siteAdmin', Boolean( _user.siteAdmin ) )
    Vue.set( this, 'email', _user.email )
  },

  logout () {
    storage.remove( 'user', 'local' )
    storage.remove( 'user', 'session' )
    _user = {}
    userInit()
    this.update()
    router.push( '/login' )
  },

  settings () {
    return JSON.parse( JSON.stringify( _user.settings ) )
  },

  serverPost ( path, data ) {
    const u = this
    if ( !data.token ) {
      data.token = _user.token
    }
    return request.post( path, data )
      .catch(function (error) {
        var msg = ''
        console.log(error)
        if (error.status === 400 || error.status === 403 ) {
          if ( error.message === 'Login expired' || error.message === 'Not logged in' ) {
            u.logout()
            return
          }
          msg = error.message
        } else {
          msg = 'Server error. Please try again later.'
        }
        alert(msg)
        throw error
      })
  },

  saveSettings ( settings ) {
    _user.settings = JSON.parse( JSON.stringify( settings ) )
    toStorage()
    this.serverPost( 'userSettings', _user )
    this.update()
  }

}
