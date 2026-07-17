import * as Chain from '../../../core/Chain.js'

export const skaleBaseSepoliaTestnet = /*#__PURE__*/ Chain.from({
  id: 324705682,
  name: 'SKALE Base Sepolia Testnet',
  nativeCurrency: { name: 'Credits', symbol: 'CREDIT', decimals: 18 },
  rpcUrls: {
    http: 'https://base-sepolia-testnet.skalenodes.com/v1/base-testnet',
    ws: 'wss://base-sepolia-testnet.skalenodes.com/v1/ws/base-testnet',
  },
  blockExplorers: {
    name: 'SKALE Explorer',
    url: 'https://base-sepolia-testnet-explorer.skalenodes.com/',
  },
  testnet: true,
})
