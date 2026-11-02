import * as Chain from '../../core/Chain.js'

export const mantleTestnet = /*#__PURE__*/ Chain.from({
  id: 5001,
  name: 'Mantle Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: { http: 'https://rpc.testnet.mantle.xyz' },
  blockExplorers: {
    name: 'Mantle Testnet Explorer',
    url: 'https://explorer.testnet.mantle.xyz',
    apiUrl: 'https://explorer.testnet.mantle.xyz/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 561333,
    },
  },
  testnet: true,
})
