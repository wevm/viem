import * as Chain from '../../core/Chain.js'

export const marsCredit = /*#__PURE__*/ Chain.from({
  id: 110110,
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscan.marscredit.xyz',
    },
  },
  name: 'Mars Credit',
  nativeCurrency: {
    decimals: 18,
    name: 'Mars Credit',
    symbol: 'MARS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.marscredit.xyz'] },
  },
})
