import * as Chain from '../../core/Chain.js'

export const nearTestnet = /*#__PURE__*/ Chain.define({
  id: 398n,
  name: 'NEAR Protocol Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: ['https://eth-rpc.testnet.near.org'] },
  },
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: 'https://eth-explorer-testnet.near.org',
    },
  },
  testnet: true,
})
