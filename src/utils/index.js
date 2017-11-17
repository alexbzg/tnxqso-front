function parseCallsigns (callsignsStr) {
  return callsignsStr.split( /[,; ]+/ ).map( function (item) {
    return item.trim().toUpperCase()
  })
}

export { parseCallsigns }
