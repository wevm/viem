import * as Chain from '../../core/Chain.js'

export const memecore = /*#__PURE__*/ Chain.from({
  id: 4352,
  name: 'MemeCore',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    http: 'https://rpc.memecore.net',
    ws: 'wss://ws.memecore.net',
  },
  blockExplorers: {
    name: 'MemeCore Explorer',
    url: 'https://memecorescan.io',
    apiUrl: 'https://api.memecorescan.io/api',
  },
})
