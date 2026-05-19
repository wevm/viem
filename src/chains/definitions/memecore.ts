import * as Chain from '../../core/Chain.js'

export const memecore = /*#__PURE__*/ Chain.define({
  id: 4352n,
  name: 'MemeCore',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.memecore.net'],
      webSocket: ['wss://ws.memecore.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MemeCore Explorer',
      url: 'https://memecorescan.io',
      apiUrl: 'https://api.memecorescan.io/api',
    },
    okx: {
      name: 'MemeCore Explorer',
      url: 'https://web3.okx.com/explorer/memecore',
    },
    memecore: {
      name: 'MemeCore Explorer',
      url: 'https://blockscout.memecore.com',
      apiUrl: 'https://blockscout.memecore.com/api',
    },
  },
})
