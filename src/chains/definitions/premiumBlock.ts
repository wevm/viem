import * as Chain from '../../core/Chain.js'

export const premiumBlockTestnet = /*#__PURE__*/ Chain.define({
  id: 23_023n,
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
