import { defineChain } from '../../utils/chain/defineChain.js'

export const vinuChainTestnet = /*#__PURE__*/ defineChain({
  id: 206,
  name: 'VinuChain Testnet',
  nativeCurrency: { name: 'VinuChain', symbol: 'VC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc.vinuchain.org',
        'https://vinufoundation-rpc.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'VinuExplorer Testnet',
      url: 'https://testnet.vinuexplorer.org',
    },
  },
  testnet: true,
})
