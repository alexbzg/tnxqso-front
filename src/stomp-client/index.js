import {Client} from '@stomp/stompjs';
import {debugLog} from '../utils'

let _client = null
const VIRTUAL_HOST = process.env.NODE_ENV == 'development' ? 'tnxqso-dev' : 'tnxqso'

export default {

  store: null,
  processPrivateMessage: null,
  subscriptionPrivateMessages: null,

  subscribePrivateMessages () {
    if (this.store.getters.userCallsign) {
      this.subsrciptionPrivateMessages = 
        _client.subscribe(`/exchange/pm/${this.store.getters.userCallsign}`,
            msg => this.onPrivateMessage(msg))
    }
  },

  onConnect (frame) {
    console.log(`connected via STOMP: ${JSON.stringify(frame)}`)
    this.subscribePrivateMessages()
  },

  logMessage (msg) {
    console.log(msg.body);
    console.log(`${msg.body}
      headers: ${JSON.stringify(msg.headers, undefined, 4)}`);
  },

  onPrivateMessage(msg) {
    this.logMessage(msg)
    if (this.processPrivateMssage) {
      this.processPrivateMessage(msg)
    }
  },

  init () {
    this.stop()
    _client = new Client({
      brokerURL: `wss://${location.host}/ws`,
      connectHeaders: {
        host: VIRTUAL_HOST,
        login: this.store.getters.userCallsign,
        passcode: this.store.getters.userToken
      },
      debug: function (str) {
        debugLog(str);
      },
      reconnectDelay: 5000
    })
    _client.onConnect = () => this.onConnect()
    _client.activate()
  },

  stop () {
    if (_client) {
      _client.deactivate()
    }
  }

}


