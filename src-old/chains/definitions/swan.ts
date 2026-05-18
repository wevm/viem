import { defineChain } from '../../utils/chain/defineChain.js'

export const swan = /*#__PURE__*/ defineChain({
  id: 254,
  name: 'Swan Chain Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet-rpc.swanchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Swan Explorer',
      url: 'https://swanscan.io',
    },
  },
  testnet: false,
})
