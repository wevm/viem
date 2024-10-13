import { defineChain } from '../../utils/chain/defineChain.js'

export const elastos = /*#__PURE__*/ defineChain({
  id: 20,
  name: 'Elastos Smart Chain',
  nativeCurrency: { name: 'ELA', symbol: 'ELA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api2.elastos.io/eth'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elastos Explorer',
      url: 'https://esc.elastos.io',
    },
  },
  testnet: false,
})
