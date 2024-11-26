import { defineChain } from '../../utils/chain/defineChain.js'

export const zircuit = /*#__PURE__*/ defineChain({
  id: 48900,
  name: 'Zircuit Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [
        'https://zircuit1-mainnet.p2pify.com',
        'https://zircuit1-mainnet.liquify.com',
        'https://zircuit-mainnet.drpc.org',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zircuit Explorer',
      url: 'https://explorer.zircuit.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: false,
})
