import request from '../request'

export default function (store, name, url) {
  const s = { l
    lastModified: null,
    load: load,
    data: null,
    station: null,
    name: null,
    processData: function () {},
    onUpdate: onUpdate 
  }

  return s

  function load () {
    return request.get(s.url)
      .then(response => {
        if (s.lastModified !== response.headers['last-modified']) {
          s.lastModified = response.headers['last-modified']
          s.data = response.data
        }
    }
  }
}
