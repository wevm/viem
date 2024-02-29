import { defineChain } from '../../utils/chain/defineChain.js'

export const blast = /*#__PURE__*/ defineChain({
    id: 81457,
    name: 'Blast',
    network: 'blast',
    nativeCurrency: {
      decimals: 18,
      name: 'Ether',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://rpc.blast.io'] },
      default: { http: ['https://rpc.blast.io'] },
    },
    blockExplorers: {
      default: { name: 'Blastscan', url: 'https://blastscan.io' },
    }
  })
