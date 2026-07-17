import * as Chain from '../../core/Chain.js'

export const bearNetworkChainTestnet = /*#__PURE__*/ Chain.from({
  id: 751230,
  name: 'Bear Network Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBRNKC',
    symbol: 'tBRNKC',
  },
  rpcUrls: { http: 'https://brnkc-test.bearnetwork.net' },
  blockExplorers: {
    name: 'BrnkTestScan',
    url: 'https://brnktest-scan.bearnetwork.net',
    apiUrl: 'https://brnktest-scan.bearnetwork.net/api',
  },
  testnet: true,
})
