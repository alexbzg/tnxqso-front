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
    processData: null,
    onUpdate: onUpdate }

  return s

  function onUpdate (callback) {
    if (s.eventName && callback) {
      bus.$on(s.eventName, callback)
    }
    if (s.data && callback) {
      callback()
    }
  }

  function load () {
    if (s.url) {
      return request.get( dataServiceUrlPrefix + s.url,
        {headers: {'If-Modified-Since': s.lastModified}})
        .then(loadComplete)
    }

    function loadComplete (response) {
      if (response && s.lastModified !== response.headers['last-modified']) {
        s.lastModified = response.headers['last-modified']
        s.data = response.data
        if (s.processData) {
          s.processData()
        }
        if (s.eventName) {
          bus.$emit(s.eventName)
        }
        return response.data
      }
    }
  }
}
