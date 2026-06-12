import { defineChain } from '../../utils/chain/defineChain.js'

export const fluentTestnet = /*#__PURE__*/ defineChain({
  id: 20_994,
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
