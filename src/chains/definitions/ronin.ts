import { defineChain } from '../../utils/chain/defineChain.js'

export const ronin = /*#__PURE__*/ defineChain({
  id: 2020,
  name: 'Ronin',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.roninchain.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ronin Explorer',
      url: 'https://app.roninchain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 26023535,
    },
  },
})
