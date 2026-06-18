import * as Chain from '../../core/Chain.js'

export const energy = /*#__PURE__*/ Chain.from({
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
