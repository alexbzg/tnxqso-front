import request from '../request'

const MUTATE_STATION = 'mttStation'
export const ACTION_LOAD_STATION = 'actnLoadStation'

export const storeStationSettings = {
  state: {
    station: null,
    enable: null,
    log: null,
    status: null
  },
  mutations: {
    [MUTATE_STATION] (state, payload) {
      Object.assign(state, payload)
    }
  },
  actions: {
    [ACTION_LOAD_STATION] ({commit}) {
      return request.get('settings.json')
        .then(response => {
          commit(MUTATE_STATION, response.data)
        })
    }
  }
}
