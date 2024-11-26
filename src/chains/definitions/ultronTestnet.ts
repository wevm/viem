import { defineChain } from '../../utils/chain/defineChain.js'

export const ultronTestnet = /*#__PURE__*/ defineChain({
  id: 1230,
  name: 'Ultron Testnet',
  nativeCurrency: { name: 'ULX', symbol: 'ULX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ultron-dev.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ultron Scan',
      url: 'https://explorer.ultron-dev.io',
    },
  },
  testnet: true,
})
