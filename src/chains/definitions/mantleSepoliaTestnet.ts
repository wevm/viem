import * as Chain from '../../core/Chain.js'

export const mantleSepoliaTestnet = /*#__PURE__*/ Chain.from({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: { http: 'https://rpc.sepolia.mantle.xyz' },
  blockExplorers: {
    name: 'Mantle Testnet Explorer',
    url: 'https://explorer.sepolia.mantle.xyz/',
    apiUrl: 'https://explorer.sepolia.mantle.xyz/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4584012,
    },
  },
  testnet: true,
})
