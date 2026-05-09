import { defineChain } from '../../utils'

export const myrx = defineChain({
  id: 8472,
  name: 'MYRX-MAINNET',
  nativeCurrency: {
    decimals: 18,
    name: 'MyRx Token',
    symbol: 'MRT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.myrxwallet.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MyRx Explorer',
      url: 'https://explorer.myrxwallet.io',
      apiUrl: 'https://explorer.myrxwallet.io/api',
    },
  },
})
