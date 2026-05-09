import { defineChain } from '../../utils/chain/defineChain.js'

export const ethernity = /*#__PURE__*/ defineChain({
  id: 183,
  name: 'Ethernity',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.ethernitychain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Ethernity Explorer',
      url: 'https://ernscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: false,
})
