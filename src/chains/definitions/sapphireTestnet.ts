import * as Chain from '../../core/Chain.js'

export const sapphireTestnet = /*#__PURE__*/ Chain.from({
  id: 23295,
  name: 'Oasis Sapphire Testnet',
  nativeCurrency: { name: 'Sapphire Test Rose', symbol: 'TEST', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.sapphire.oasis.dev'],
      webSocket: ['wss://testnet.sapphire.oasis.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Oasis Explorer',
      url: 'https://explorer.oasis.io/testnet/sapphire',
    },
  },
  testnet: true,
})
