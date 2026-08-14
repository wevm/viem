import { defineChain } from '../../utils/chain/defineChain.js'

export const eden = /*#__PURE__*/ defineChain({
  id: 714,
  name: 'Eden',
  nativeCurrency: {
    name: 'TIA',
    symbol: 'TIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.eden.gateway.fm'],
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://eden.blockscout.com',
      apiUrl: 'https://eden.blockscout.com/api',
    },
  },
})
