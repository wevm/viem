import { defineChain } from '../../utils/chain/defineChain.js'

export const marsCredit = /*#__PURE__*/ defineChain({
  id: 110110,
  name: 'Mars Credit',
  nativeCurrency: {
    decimals: 18,
    name: 'Mars Credit',
    symbol: 'MARS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.marscredit.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscan.marscredit.xyz',
    },
  },
})
