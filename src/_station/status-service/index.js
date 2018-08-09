import dataServiceFactory from '../../data-service-factory'

let s = dataServiceFactory()

s.url = 'status.json'
s.eventName = 'status-changed'

export default s
