import { defineChain } from '../../utils/chain/defineChain.js'

export const argochain = /*#__PURE__*/ defineChain({
  id: 1299,
  name: 'Argochain',
  nativeCurrency: { name: 'Argocoin', symbol: 'AGC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.devolvedai.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Argochain Scanner',
      url: 'https://scanner.argoscan.net/',
    },
  },
})
