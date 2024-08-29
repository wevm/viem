import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 8453 // base

export const b3 = /*#__PURE__*/ defineChain({
  id: 8333,
  name: 'B3',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.b3.fun/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.b3.fun',
    },
  },
  sourceId,
})
