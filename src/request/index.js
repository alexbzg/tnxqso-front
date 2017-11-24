import axios from 'axios'

const API_URL = '/aiohttp/'

export default {

  onError (error) {
    var e = { status: 0 }
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
      if (error.response.status === 400) {
        e.status = 400
        e.message = error.response.data
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message)
    }
    console.log(error.config)
    throw e
  },

  post (URL, data) {
    return axios.post(API_URL + URL, data)
      .catch(this.onError)
  },

  get (URL) {
    if (!URL.startsWith('/')) {
      URL = window.location.pathname + '/' + URL
    }
    return axios.get(URL)
      .catch(this.onError)
  }

}
