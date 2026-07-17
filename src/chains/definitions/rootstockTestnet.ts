import * as Chain from '../../core/Chain.js'

export const rootstockTestnet = /*#__PURE__*/ Chain.from({
  id: 31,
  name: 'Rootstock Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Bitcoin',
    symbol: 'tRBTC',
  },
  rpcUrls: { http: 'https://public-node.testnet.rsk.co' },
  blockExplorers: {
    name: 'RSK Explorer',
    url: 'https://explorer.testnet.rootstock.io',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2771150,
    },
  },
  testnet: true,
})
