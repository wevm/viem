import { defineChain } from '../../utils/chain/defineChain.js'

export const hashkeyTestnet = /*#__PURE__*/ defineChain({
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey EcoPoints',
    symbol: 'HSK',
  },
  rpcUrls: {
    default: {
      http: ['https://hashkeychain-testnet.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashKey Chain Explorer',
      url: 'https://hashkeychain-testnet-explorer.alt.technology',
    },
  },
  testnet: true,
})
