import storage from '../storage'
import request from '../request'
import Vue from 'vue'

import {setDataServiceUrlPrefix} from '../data-service-factory'

var _user = {}

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

const u = {

  useDataServiceUrlPrefix: false,

  switchDataServiceUrlPrefix ( on ) {
    this.useDataServiceUrlPrefix = on
    if (on && _user.settings.station.callsign ) {
      let scs = _user.settings.station.callsign
      scs = scs.replace( /\//, '-' ).toLowerCase()
      setDataServiceUrlPrefix( '/static/stations/' + scs + '/' )
    } else {
      setDataServiceUrlPrefix( '' )
    }
  },

  login ( data, remember ) {
    let user = this
    return request.post( 'login', data )
      .then( function ( response ) {
        _user = response.data
        _user.remember = remember
        toStorage()
        userInit()
        user.update()
      })
  },

  update () {
    Vue.set( this, 'loggedIn', Boolean( _user.token ) )
    Vue.set( this, 'callsign', _user.callsign )
    Vue.set( this, 'stationCallsign', _user.settings.station.callsign !== ''
      ? _user.settings.station.callsign : false )
    Vue.set( this, 'siteAdmin', Boolean( _user.siteAdmin ) )
    Vue.set( this, 'email', _user.email )
    this.switchDataServiceUrlPrefix( this.useDataServiceUrlPrefix )
  },

  logout () {
    storage.remove( 'user', 'local' )
    storage.remove( 'user', 'session' )
    _user = {}
    userInit()
    this.update()
  },

  settings () {
    return JSON.parse( JSON.stringify( _user.settings ) )
  },

  serverPost ( path, data, supressAlert ) {
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
        if ( !supressAlert ) {
          alert(msg)
        }
        throw error
      })
  },

  saveSettings ( settings ) {
    const data = JSON.parse( JSON.stringify( _user ) )
    const u = this
    data.settings = JSON.parse( JSON.stringify( settings ) )
    toStorage()
    return this.serverPost( 'userSettings', data )
      .then( function () {
        _user.settings = data.settings
        toStorage()
        u.update()
      })
  }

}

function fromStorage () {
  _user = storage.load( 'user' )
  if ( !_user ) {
    _user = {}
  }
  if ( _user.token ) {
    u.serverPost( 'userData', {} )
      .then( function ( response ) {
        response.data.token = _user.token
        response.data.remember = _user.remember
        _user = response.data
        toStorage()
      })
  }
  userInit()
  u.update()
}

fromStorage()

export default u
