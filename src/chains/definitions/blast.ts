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
    },
    contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11',
          blockCreated: 212929,
        },
      },
  })
