import { defineChain } from '../../utils/chain/defineChain.js'

export const sevenChain = /*#__PURE__*/ defineChain({
  id: 70007,
  name: 'Seven Chain',
  blockTime: 3000,
  nativeCurrency: {
    decimals: 18,
    name: 'SEVEN',
    symbol: 'SEVEN',
  },
  rpcUrls: {
    default: {
      http: ['https://theseven.meme/api/seven-chain/jsonrpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SevenScan',
      url: 'https://theseven.meme/blockchain/explorer',
    },
  },
  testnet: false,
})
