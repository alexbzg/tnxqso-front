import {Client} from '@stomp/stompjs';
import {debugLog} from '../utils'

let _client = null
const VIRTUAL_HOST = process.env.NODE_ENV == 'development' ? 'tnxqso-dev' : 'tnxqso'

export default {

  subscriptions: {},

  subscribe(title, destination, callback) {
    this.subscriptions[title] = _client.subscribe(
        destination,
        message => {
          this.logMessage(message)
          callback?.(JSON.parse(message.body))
        })
  },

  onConnect (frame) {
    debugLog(`connected via STOMP: ${JSON.stringify(frame)}`)
  },

  logMessage (msg) {
    debugLog(msg.body)
    debugLog(`headers: ${JSON.stringify(msg.headers, undefined, 4)}`)
  },

  init (login, passcode, callback) {
    this.stop()
    _client = new Client({
      brokerURL: `wss://${location.host}/ws`,
      connectHeaders: {
        host: VIRTUAL_HOST,
        login,
        passcode
      },
      debug: function (str) {
        debugLog(str);
      },
      reconnectDelay: 5000
    })
    _client.onConnect = (frame) => { 
        this.onConnect(frame)
        callback?.()
    }
    _client.activate()
  },

  stop () {
    if (_client) {
      _client.deactivate()
    }
  }

}


