import storage from '../storage'

const STORAGE_KEY_LANGUAGE = 'lng'

export const MUTATE_LANGUAGE = 'mttLng'

export const storeLanguage = {
  state: {
    language: storage.load(STORAGE_KEY_LANGUAGE, 'local') || 'en'
  },
  getters: {
    language: state => {
      return state.language
    }
  },
  mutations: {
    [MUTATE_LANGUAGE] (state, payload) {
      if (state.language !== payload) {
        state.language = payload
        storage.save(STORAGE_KEY_LANGUAGE, payload, 'local')
      }
    }
  }
}
