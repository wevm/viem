import { defineChain } from '../../utils/chain/defineChain.js'

export const arbitrum = /*#__PURE__*/ defineChain({
  id: 12324,
  name: 'L3X Protocol',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [''],
    },
  },
  blockExplorers: {
    default: {
      name: '',
      url: '',
      apiUrl: '',
    },
  },
  contracts: {},
})
