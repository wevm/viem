import * as Chain from '../../core/Chain.js'

export const superlumio = /*#__PURE__*/ Chain.define({
  id: 8866n,
  name: 'SuperLumio',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.lumio.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumio explorer',
      url: 'https://explorer.lumio.io',
    },
  },
  testnet: false,
})
