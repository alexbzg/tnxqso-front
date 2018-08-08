function parseCallsigns (callsignsStr) {
  return callsignsStr.split( /[,; ]+/ ).map( function (item) {
    return item.trim().toUpperCase()
  })
}

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function loadScript (url) {
  if (Array.isArray(url)) {
    let self = this
    let prom = []
    url.forEach(function (item) {
      prom.push(self.script(item))
    })
    return Promise.all(prom)
  }

  return new Promise(function (resolve, reject) {
    let r = false
    let t = document.getElementsByTagName('script')[0]
    let s = document.createElement('script')

    s.type = 'text/javascript'
    s.src = url
    s.async = true
    s.onload = s.onreadystatechange = function () {
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true
        resolve(this)
      }
    }
    s.onerror = s.onabort = reject
    t.parentNode.insertBefore(s, t)
  })
}

function replace0 (str) {
  return str ? str.replace( /0/g, '\u00D8' ) : str
}

function getStationURL (callsign) {
  const l = window.location
  return callsign ? ( l.protocol + '//' + l.host + '/' +
    callsign.replace( /\//g, '-' ).toLowerCase() ) : null
}

function deepCopy (obj) {
  return JSON.parse( JSON.stringify( obj ) )
}

export { parseCallsigns, loadScript, validateEmail, replace0, getStationURL, deepCopy }
