import { defineChain } from '../../utils/chain/defineChain.js'

export const taraxa = /*#__PURE__*/ defineChain({
  id: 841,
  name: 'Taraxa Mainnet',
  nativeCurrency: { name: 'Tara', symbol: 'TARA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.taraxa.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Taraxa Explorer',
      url: 'https://explorer.mainnet.taraxa.io',
    },
  },
})
