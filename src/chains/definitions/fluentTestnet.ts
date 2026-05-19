import * as Chain from '../../core/Chain.js'

export const fluentTestnet = /*#__PURE__*/ Chain.define({
  id: 20_994n,
  name: 'Fluent Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.fluent.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fluent Testnet Explorer',
      url: 'https://testnet.fluentscan.xyz',
    },
  },
  testnet: true,
})
