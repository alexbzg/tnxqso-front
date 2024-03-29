function parseCallsigns (callsignsStr) {
  return callsignsStr.split( /[,; ]+/ ).map( function (item) {
    return item.trim().toUpperCase()
  })
}

export function debugLog (msg) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(msg)
  }
}

import QTH_PARAMS from '../../public/static/js/qthParams.json'

export function qthFieldTitles (country) {
  const r = []
  for (let co = 0; co < QTH_PARAMS.fieldCount; co++) {
    r.push(QTH_PARAMS.defaultTitle)
  }
  if (country) {
    const countryFields = QTH_PARAMS.countries[country].fields
    for (let co = 0; co < countryFields.length; co++) {
      r[co] = countryFields[co]
    }
  }
  return r
}

import * as moment from 'moment'

export function formatPeriod (period) {
  const fdt = period.map(item => item ? moment(item, 'DD.MM.YYYY').format( 'DD MMM YYYY' ).toLowerCase() : '')
  if (fdt[0] === fdt[1]) {
    return fdt[0]
  } else {
    return fdt[0] + ' \u2014 ' + fdt[1]
  }
}

export function hash(str) {
  let hash = 5381
  let i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0
}

function validateEmail (email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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

const RE_STRIP_CALLSIGN = /\d*[a-zA-Z]+\d+[a-zA-Z]+/

function urlCallsign ( callsign ) {
  return RE_STRIP_CALLSIGN.exec(callsign.toLowerCase())?.[0] || null
}

function urlAdminCallsign ( callsign ) {
  return callsign?.replace( /\//g, '-' ).toLowerCase() || null

}

function getStationURL (callsign) {
  const l = window.location
  return callsign ? ( l.protocol + '//' + l.host + '/' +
    urlCallsign( callsign ) ) : null
}

function deepCopy (obj) {
  return JSON.parse( JSON.stringify( obj ) )
}

function plainText (html) {
  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

export { parseCallsigns, loadScript, validateEmail, replace0, getStationURL, urlCallsign, urlAdminCallsign, deepCopy, plainText }
