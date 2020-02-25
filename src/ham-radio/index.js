import rdaShort from '../rdaShort.json'

export const BANDS = ['1.8', '3.5', '7', '10', '14', '18', '21', '24', '28']

export function orderedBands () {
  return BANDS.slice().sort((a, b) => {
    return Number(a) - Number(b)
  })
}

export const MODES = ['CW', 'SSB', 'DIGI']
export const MODES_FULL = {
  'CW': ['CW'],
  'SSB': ['USB', 'SSB', 'LSB', 'AM', 'FM'],
  'DIGI': ['FT8', 'FT4', 'JT65']
}
export const ROLES = {hunter: 'Hunter', activator: 'Activator'}

const rdaValues = []
for (const group of rdaShort) {
  for (let c = 1; c <= group.last; c++) {
    if ('skip' in group && group.skip.includes(c)) {
      continue
    }
    rdaValues.push(group.group + '-' + (c < 10 ? '0' + c : c))
  }
}
export {rdaValues}

const reRDA = /([a-z][a-z])[-_ ]?(\d\d)/gi

export function parseRDA (val) {
  let rdaMatch = null
  let r = null
  while ((rdaMatch = reRDA.exec(val)) !== null) {
    let rda = (rdaMatch[1] + '-' + rdaMatch[2]).toUpperCase()
    if (rdaValues.includes(rda)) {
      r = rda
      break
    }
  }
  reRDA.lastIndex = 0
  return r
}

const RE_STRIP_CALLSIGN = /\d*[A-Z]+\d+[A-Z]+/

export function stripCallsign (callsign) {
  let match = null
  if (match = RE_STRIP_CALLSIGN.exec(callsign)) {
    return match[0]
  } else {
    return null
  }
}

const RE_CALLSIGN_FULL = /^(:?[A-Z\d]+\/)?\d?[A-Z]+\d+[A-Z]+(:?\/[A-Z\d]+)*$/

export function validCallsignFull (callsign) {
  return RE_CALLSIGN_FULL.test(callsign)
}

