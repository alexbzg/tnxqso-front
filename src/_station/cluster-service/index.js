import dataServiceFactory from '../../data-service-factory'

let s = dataServiceFactory()

s.url = 'cluster.json'
s.eventName = 'cluster-changed'

export default s
