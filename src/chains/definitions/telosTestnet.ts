import { defineChain } from '../../utils/chain/defineChain.js'

export const telosTestnet = /*#__PURE__*/ defineChain({
  id: 41,
  name: 'Telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    default: { http: ['https://testnet.telos.net/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan (testnet)',
      url: 'https://testnet.teloscan.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xAE96D72FE112a9eB21C5627222F9173E9FF9b285',
      blockCreated: 278_551_551,
    },
  },
  testnet: true,
})
