import { defineChain } from '../../utils/chain/defineChain.js'

export const curtis = /*#__PURE__*/ defineChain({
  id: 33111,
  name: 'Curtis',
  nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.curtis.apechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Curtis explorer',
      url: 'https://curtis.explorer.caldera.xyz/',
      apiUrl: 'https://api.curtis.explorer.caldera.xyz/api',
    },
  },
  testnet: true,
})
