import * as Chain from '../../core/Chain.js'

export const tomb = /*#__PURE__*/ Chain.from({
  id: 6969,
  name: 'Tomb Mainnet',
  nativeCurrency: { name: 'TOMB', symbol: 'TOMB', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.tombchain.com',
  },
  blockExplorers: {
    name: 'Tomb Explorer',
    url: 'https://tombscout.com',
  },
  testnet: false,
})
