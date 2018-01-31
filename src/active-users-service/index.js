import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = 'activeUsers.json'
s.eventName = 'active-users-updated'

export default s
