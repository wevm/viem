import * as Chain from '../../core/Chain.js'

export const formicarium = /*#__PURE__*/ Chain.from({
  id: 43521,
  name: 'Formicarium',
  nativeCurrency: {
    decimals: 18,
    name: 'M',
    symbol: 'M',
  },
  rpcUrls: {
    http: 'https://rpc.formicarium.memecore.net',
    ws: 'wss://ws.formicarium.memecore.net',
  },
  blockExplorers: {
    name: 'MemeCore Testnet Explorer',
    url: 'https://formicarium.memecorescan.io',
  },
  testnet: true,
})
