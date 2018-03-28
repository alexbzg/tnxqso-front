import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = 'instagram.json'
s.eventName = 'instagram-changed'

export default s
