import * as Chain from '../../core/Chain.js'

export const hausTestnet = /*#__PURE__*/ Chain.from({
  id: 2_443,
  name: 'Haus Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Haus',
    symbol: 'HAUS',
  },
  rpcUrls: { http: 'https://rpc-testnet.hausserver.xyz' },
  blockExplorers: {
    name: 'Haus Chain Testnet Explorer',
    url: 'https://explorer-testnet.hausserver.xyz',
    apiUrl: 'https://explorer-testnet.hausserver.xyz/api',
  },
  testnet: true,
})
