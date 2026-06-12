import { defineChain } from '../../utils/chain/defineChain.js'

export const premiumBlockTestnet = /*#__PURE__*/ defineChain({
  id: 23_023,
  name: 'PremiumBlock Testnet',
  nativeCurrency: { name: 'Premium Block', symbol: 'PBLK', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.premiumblock.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PremiumBlocks Explorer',
      url: 'https://scan.premiumblock.org',
    },
  },
  testnet: true,
})
