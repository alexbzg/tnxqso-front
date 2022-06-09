import axios from 'axios'

import {urlCallsign, debugLog} from '../utils'

const API_URL = '/aiohttp/'

export default {

  onError (error) {
    var e = { status: 0 }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      debugLog(error.response.data)
      debugLog(error.response.status)
      debugLog(error.response.headers)
      e.message = error.response.data
      e.status = error.response.status
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      debugLog(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      debugLog('Error', error.message)
    }
    debugLog(error.config)
    throw e
  },

  post (URL, data, multipart) {
    if (multipart) {
      const fData = new FormData()
      for (const key in data) {
        fData.append(key, data[key])
      }
      return axios({
        method: 'post',
        url: API_URL + URL,
        data: fData,
        headers: {'Content-Type': 'multipart/form-data'}
      })
        .catch(this.onError)
    } else {
      return axios.post(API_URL + URL, data)
        .catch(this.onError)
    }
  },

  get (URL) {
    if (!URL.startsWith('/')) {
      URL = window.location.pathname + '/' + URL
    }
    return axios.get(URL)
      .catch(this.onError)
  },

  getJSON (file, station) {
    let URL = file + '.json'
    if (station) {
      URL = '/static/stations/' + urlCallsign(station) + '/' + URL
    } else {
      URL = '/static/js/' + URL
    }
    return this.get(URL)
  }

}
