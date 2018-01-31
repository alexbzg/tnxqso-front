import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = 'log.json'
s.eventName = 'log-changed'

export default s
