import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = '/talks.json'
s.eventName = 'talks-updated'

export default s
