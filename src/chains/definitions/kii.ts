import { defineChain } from '../../utils/chain/defineChain.js'

export const kii = /*#__PURE__*/ defineChain({
  id: 1783,
  name: 'KiiChain',
  network: 'kii-chain',
  nativeCurrency: {
    name: 'Kii',
    symbol: 'KII',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.kiivalidator.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KiiExplorer',
      url: 'https://explorer.kiichain.io',
    },
  },
})
