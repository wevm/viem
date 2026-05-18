import { defineChain } from '../../utils/chain/defineChain.js'

export const fluentDevnet = /*#__PURE__*/ defineChain({
  id: 20_993,
  name: 'Fluent Devnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.devnet.fluent.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fluent Devnet Explorer',
      url: 'https://devnet.fluentscan.xyz',
    },
  },
  testnet: true,
})
