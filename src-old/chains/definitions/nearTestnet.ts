import { defineChain } from '../../utils/chain/defineChain.js'

export const nearTestnet = /*#__PURE__*/ defineChain({
  id: 398,
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
