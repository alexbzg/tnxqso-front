import dataServiceFactory from '../data-service-factory'

let s = dataServiceFactory()

s.url = 'chat.json'
s.eventName = 'chat-updated'

export default s
