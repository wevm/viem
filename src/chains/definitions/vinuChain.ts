import { defineChain } from '../../utils/chain/defineChain.js'

export const vinuChain = /*#__PURE__*/ defineChain({
  id: 207,
  name: 'VinuChain',
  nativeCurrency: { name: 'VinuChain', symbol: 'VC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.vinuchain.org', 'https://vinuchain-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VinuExplorer',
      url: 'https://vinuexplorer.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: false,
})
