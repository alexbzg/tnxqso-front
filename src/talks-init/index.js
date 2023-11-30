import {MUTATE_SERVICE, ACTION_UPDATE_SERVICE} from '../store-services'


export default function (store, station) {
  const name = station ? 'chat' : 'talks'
  store.commit(MUTATE_SERVICE, {name: name, station: station})
  store.dispatch(ACTION_UPDATE_SERVICE, name)
}
