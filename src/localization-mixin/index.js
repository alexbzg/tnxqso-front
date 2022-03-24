import {mapGetters} from 'vuex'

import STRINGS from './strings.json'

export default {
  computed: {
    ...mapGetters(['language'])
  },
  methods: {
    getString (id) {
      return STRINGS[id][this.language]
    }
  }
}
