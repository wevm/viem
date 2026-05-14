import { defineChain } from '../../utils/chain/defineChain.js'

export const ebChain = defineChain({
  id: 8721,
  name: 'EB-Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'EBC',
    symbol: 'EBC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ebcscan.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'EBCScan',
      url: 'https://ebcscan.net',
    },
  },
})
