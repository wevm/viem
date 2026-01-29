import { defineChain } from '../../utils/chain/defineChain.js'

/** @deprecated Use `storyAeneid` instead  */
export const storyOdyssey = /*#__PURE__*/ defineChain({
  id: 1516,
  name: 'Story Odyssey',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.odyssey.storyrpc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Odyssey Explorer',
      url: 'https://odyssey.storyscan.xyz',
    },
  },
  testnet: true,
})
