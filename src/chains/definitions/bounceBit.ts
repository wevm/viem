import { defineChain } from '../../utils/chain/defineChain.js'

export const bounceBit = /*#__PURE__*/ defineChain({
  id: 6001,
  name: 'BounceBit Mainnet',
  nativeCurrency: { name: 'BounceBit', symbol: 'BB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://fullnode-mainnet.bouncebitapi.com'] },
  },
  blockExplorers: {
    default: {
      name: 'BB Scan',
      url: 'https://bbscan.io',
    },
  },
  testnet: false,
})
