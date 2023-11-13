import {mapGetters} from 'vuex'

import STRINGS from './strings.json'

export function getString(id, language) {
  return STRINGS[id][language]
}

export default {
  computed: {
    ...mapGetters(['language'])
  },
  methods: {
    getString (id) {
      return getString(id, this.language)
    },
    formatString(id, params) {
      let str = this.getString(id)
      for (const param in params)
        str = str.replaceAll(`{${param}}`, params[param])
      return str
    }
  }
}


