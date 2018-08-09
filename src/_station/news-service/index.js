import dataServiceFactory from '../../data-service-factory'

let s = dataServiceFactory()

s.url = 'news.json'
s.eventName = 'news-changed'

export default s
