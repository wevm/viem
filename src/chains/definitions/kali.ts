import { defineChain } from '../../utils/chain/defineChain.js'

export const kali = /*#__PURE__*/ defineChain({
  id: 654,
  name: 'Kali Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'KALIS',
    symbol: 'KALIS',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.kalichain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Kali Explorer',
      url: 'https://explorer.kalichain.com/',
    },
  },
})
