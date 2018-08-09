import dataServiceFactory from '../../data-service-factory'

let s = dataServiceFactory()

s.url = 'settings.json'
s.eventName = 'station-settings-changed'

export default s
