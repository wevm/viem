import { defineChain } from '../../utils/chain/defineChain.js'

export const goat = /*#__PURE__*/ defineChain({
  id: 2345,
  name: 'GOAT',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.goat.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Goat Explorer',
      url: 'https://explorer.goat.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
})
