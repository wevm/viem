import { defineChain } from '../../utils/chain/defineChain.js'

export const dogechain = /*#__PURE__*/ defineChain({
  id: 2_000,
  name: 'Dogechain',
  nativeCurrency: {
    decimals: 18,
    name: 'Dogechain',
    symbol: 'DC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.dogechain.dog'] },
  },
  blockExplorers: {
    default: {
      name: 'DogeChainExplorer',
      url: 'https://explorer.dogechain.dog',
      apiUrl: 'https://explorer.dogechain.dog/api',
    },
  },
})
