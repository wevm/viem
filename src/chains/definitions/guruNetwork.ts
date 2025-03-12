import { defineChain } from '../../utils/chain/defineChain.js'

export const guruNetwork = /*#__PURE__*/ defineChain({
  id: 260,
  name: 'Guru Network Mainnet',
  nativeCurrency: {
    name: 'GURU Token',
    symbol: 'GURU',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-main.gurunetwork.ai',
        'https://rpc.gurunetwork.ai/archive/260',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Guruscan',
      url: 'https://scan.gurunetwork.ai',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 271691,
    },
  },
  testnet: false,
})
