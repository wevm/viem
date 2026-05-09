import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleBaseSepoliaTestnet = /*#__PURE__*/ defineChain({
  id: 324705682,
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
