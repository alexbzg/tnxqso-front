import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = 'track.json'
s.eventName = 'track-changed'

export default s
