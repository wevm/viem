import * as Chain from '../../core/Chain.js'

export const lumiaTestnet = /*#__PURE__*/ Chain.from({
  id: 1952959480,
  name: 'Lumia Testnet',
  nativeCurrency: {
    name: 'Lumia',
    symbol: 'LUMIA',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet-rpc.lumia.org',
  },
  blockExplorers: {
    name: 'Lumia Testnet Explorer',
    url: 'https://testnet-explorer.lumia.org/',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2235063,
    },
  },
  testnet: true,
})
