import { defineChain } from '../../utils/chain/defineChain.js'

export const elastosTestnet = /*#__PURE__*/ defineChain({
  id: 21,
  name: 'Elastos Smart Chain Testnet',
  nativeCurrency: { name: 'tELA', symbol: 'tELA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api-testnet.elastos.io/eth'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elastos Explorer',
      url: 'https://esc-testnet.elastos.io',
    },
  },
  testnet: true,
})
