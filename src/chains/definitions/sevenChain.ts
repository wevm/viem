import { defineChain } from '../../utils/chain/defineChain.js'

export const sevenChain = /*#__PURE__*/ defineChain({
  id: 70007,
  name: 'Seven Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Seven',
    symbol: 'SEVEN',
  },
  rpcUrls: {
    default: { http: ['https://theseven.meme/api/seven-chain/jsonrpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Seven Chain Explorer',
      url: 'https://theseven.meme/blockchain/explorer',
    },
  },
})
