import { defineChain } from '../../utils/chain/defineChain.js'

export const uniqueOpal = /*#__PURE__*/ defineChain({
  id: 8882,
  name: 'Opal Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPL',
    symbol: 'OPL',
  },
  rpcUrls: {
    default: { http: ['https://rpc-opal.unique.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Opal Subscan',
      url: 'https://opal.subscan.io/',
    },
  },
  testnet: true,
})
