import * as Chain from '../../core/Chain.js'

export const moonbeamDev = /*#__PURE__*/ Chain.from({
  id: 1281,
  name: 'Moonbeam Development Node',
  nativeCurrency: {
    decimals: 18,
    name: 'DEV',
    symbol: 'DEV',
  },
  rpcUrls: {
    http: 'http://127.0.0.1:9944',
    ws: 'wss://127.0.0.1:9944',
  },
})
