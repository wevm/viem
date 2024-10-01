import { defineChain } from '../../utils/chain/defineChain.js'

export const worldchainSepolia = /*#__PURE__*/ defineChain({
  id: 4801,
  name: 'World Chain Sepolia',
  network: 'worldchain-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-sepolia.g.alchemy.com/public'] },
    public: { http: ['https://worldchain-sepolia.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: {
      name: 'World Chain Sepolia Explorer',
      url: 'https://worldchain-sepolia.explorer.alchemy.com',
    },
  },
  testnet: true,
})
