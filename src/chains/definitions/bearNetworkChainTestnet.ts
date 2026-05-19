import * as Chain from '../../core/Chain.js'

export const bearNetworkChainTestnet = /*#__PURE__*/ Chain.define({
  id: 751230n,
  name: 'Bear Network Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBRNKC',
    symbol: 'tBRNKC',
  },
  rpcUrls: {
    default: { http: ['https://brnkc-test.bearnetwork.net'] },
  },
  blockExplorers: {
    default: {
      name: 'BrnkTestScan',
      url: 'https://brnktest-scan.bearnetwork.net',
      apiUrl: 'https://brnktest-scan.bearnetwork.net/api',
    },
  },
  testnet: true,
})
