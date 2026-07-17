import * as Chain from '../../core/Chain.js'

export const somniaTestnet = /*#__PURE__*/ Chain.from({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    http: 'https://api.infra.testnet.somnia.network',
  },
  blockExplorers: {
    name: 'Somnia Testnet Explorer',
    url: 'https://shannon-explorer.somnia.network',
    apiUrl: 'https://shannon-explorer.somnia.network/api',
  },
  contracts: {
    multicall3: {
      address: '0x841b8199E6d3Db3C6f264f6C2bd8848b3cA64223',
      blockCreated: 71314235,
    },
  },
  testnet: true,
})
