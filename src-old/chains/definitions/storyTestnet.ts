import { defineChain } from '../../utils/chain/defineChain.js'

/** @deprecated Use `storyAeneid` instead  */
export const storyTestnet = /*#__PURE__*/ defineChain({
  id: 1513,
  name: 'Story Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://testnet.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Testnet Explorer',
      url: 'https://testnet.storyscan.xyz',
    },
  },
  testnet: true,
})
