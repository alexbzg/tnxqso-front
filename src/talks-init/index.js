import {MUTATE_SERVICE, ACTION_UPDATE_SERVICE} from '../store-services'

const RELOAD_INT_TALKS = 5000

export default function (store, station) {
  const name = station ? 'chat' : 'talks'
  store.commit(MUTATE_SERVICE, {name: name, station: station})
  setInterval(() => { store.dispatch(ACTION_UPDATE_SERVICE, name) },
    RELOAD_INT_TALKS)
}
