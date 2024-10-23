import { defineChain } from '../../utils/chain/defineChain.js'

export const swellL2 = /*#__PURE__*/ defineChain({
  id: 1923,
  name: 'Swell L2',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [''], 
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: '',
      apiUrl: '', 
    },
  },
  testnet: false,
})
