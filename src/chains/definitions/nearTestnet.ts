import * as Chain from '../../core/Chain.js'

export const nearTestnet = /*#__PURE__*/ Chain.from({
  id: 398,
  name: 'NEAR Protocol Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: { http: 'https://eth-rpc.testnet.near.org' },
  blockExplorers: {
    name: 'NEAR Explorer',
    url: 'https://eth-explorer-testnet.near.org',
  },
  testnet: true,
})
