import * as Chain from '../../core/Chain.js'

export const l3x = /*#__PURE__*/ Chain.from({
  id: 12324,
  name: 'L3X Protocol',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.l3x.com'],
      webSocket: ['wss://rpc-mainnet.l3x.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'L3X Mainnet Explorer',
      url: 'https://explorer.l3x.com',
      apiUrl: 'https://explorer.l3x.com/api/v2',
    },
  },
  testnet: false,
})
