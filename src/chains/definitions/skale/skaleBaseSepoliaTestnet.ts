import * as Chain from '../../../core/Chain.js'

export const skaleBaseSepoliaTestnet = /*#__PURE__*/ Chain.define({
  id: 324705682n,
  name: 'SKALE Base Sepolia Testnet',
  nativeCurrency: { name: 'Credits', symbol: 'CREDIT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://base-sepolia-testnet.skalenodes.com/v1/base-testnet'],
      webSocket: [
        'wss://base-sepolia-testnet.skalenodes.com/v1/ws/base-testnet',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://base-sepolia-testnet-explorer.skalenodes.com/',
    },
  },
  testnet: true,
})
