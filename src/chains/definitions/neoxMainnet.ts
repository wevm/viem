import * as Chain from '../../core/Chain.js'

export const neoxMainnet = /*#__PURE__*/ Chain.from({
  id: 47763,
  name: 'Neo X Mainnet',
  nativeCurrency: { name: 'Gas', symbol: 'GAS', decimals: 18 },
  rpcUrls: {
    http: [
      'https://mainnet-1.rpc.banelabs.org',
      'https://mainnet-2.rpc.banelabs.org',
    ],
  },
  blockExplorers: {
    name: 'Neo X - Explorer',
    url: 'https://xexplorer.neo.org',
  },
  testnet: false,
})
