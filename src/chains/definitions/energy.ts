import { defineChain } from '../../utils/chain/defineChain.js'

export const energy = /*#__PURE__*/ defineChain({
  id: 246,
  name: 'Energy Mainnet',
  nativeCurrency: { name: 'EWT', symbol: 'EWT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.energyweb.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'EnergyWeb Explorer',
      url: 'https://explorer.energyweb.org',
    },
  },
  testnet: false,
})
