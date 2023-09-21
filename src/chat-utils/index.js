import sanitizeHTML from 'sanitize-html'

import {SMILIES_IMG_PATH} from '../components/Smilies'

const RE_MSG_TO = /(:?\u21d2\s?\w+(:?\/\w+)*\s?)+(:?\s|$)/

const MSG_SANITIZE_HTML_SETTINGS = {
  allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'],
  allowedAttributes: {
    img: ['src']
  }
}

export function parseMsgText (text, smilies=true) {
  text = sanitizeHTML(text, MSG_SANITIZE_HTML_SETTINGS)
  if (smilies)
    text = text.replace(/:(\d\d):/g, '<image src="' + SMILIES_IMG_PATH + '$1.gif"/>')

  let match = RE_MSG_TO.exec(text)
  let to = []
  if (match) {
    to = match[0]
    text = text.replace(to, '')
    to = to.split(/\s?\u21d2\s?/)
    to.shift()
    to = to.map(item => item.trim())
  }
  return { text, to }
}

export function replyTo (callsign, text) {
  const replyStr = String.fromCharCode(8658) + ' ' + callsign
  if (!text || text.indexOf(replyStr) === -1)
    text = `${replyStr} ${text}`
  return text 
}
