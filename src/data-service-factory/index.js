import request from '../request'
import Vue from 'vue'

let dataServiceUrlPrefix = ''

export function setDataServiceUrlPrefix (val) {
  dataServiceUrlPrefix = val
}

export default function () {
  let bus = new Vue({})
  let s = { lastModified: null,
    load: load,
    data: null,
    url: null,
    eventName: null,
    processData: function () {},
    onUpdate: onUpdate }

  return s

  function onUpdate ( callback ) {
    bus.$on( s.eventName, callback )
    if (s.data) {
      callback()
    }
  }

  function load () {
    return request.get( dataServiceUrlPrefix + s.url )
      .then(loadComplete)

    function loadComplete (response) {
      if (s.lastModified !== response.headers['last-modified']) {
        s.lastModified = response.headers['last-modified']
        s.data = response.data
        s.processData()
        bus.$emit(s.eventName)
      }
      return response.data
    }
  }
}
