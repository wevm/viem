import { defineChain } from '../../utils/chain/defineChain.js'

export const fluentTestnet = /*#__PURE__*/ defineChain({
  id: 20_993,
  name: 'Fluent Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.dev.gblend.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fluent Explorer',
      url: 'https://blockscout.dev.gblend.xyz',
    },
  },
  testnet: true,
})
