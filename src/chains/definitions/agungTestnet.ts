import { defineChain } from '../../utils/chain/defineChain.js'

export const agungTestnet = /*#__PURE__*/ defineChain({
  id: 9990,
  name: 'Agung Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Agung',
    symbol: 'AGNG',
  },
  rpcUrls: {
    default: {
      http: ['https://wss-async.agung.peaq.network'],
      webSocket: ['wss://wss-async.agung.peaq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://agung-testnet.subscan.io',
    },
  },
  testnet: true,
})
