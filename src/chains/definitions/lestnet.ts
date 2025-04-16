import { defineChain } from '../../utils/chain/defineChain.js'

export const lestnet = /*#__PURE__*/ defineChain({
  id: 21363,
  name: 'Lestnet',
  nativeCurrency: { name: 'Lestnet Ether', symbol: 'LETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://service.lestnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lestnet Explorer',
      url: 'https://explore.lestnet.org',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x03c26Ad8dE9277597CFEAB8E64Ada2Ca75bA87C8',
      blockCreated: 1252245,
    },
  },
})
