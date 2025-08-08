import { defineChain } from '../../utils/chain/defineChain.js'

export const tac = /*#__PURE__*/ defineChain({
  id: 239,
  name: 'TAC',
  nativeCurrency: { name: 'TAC', symbol: 'TAC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/tac'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://tac.blockscout.com',
      apiUrl: 'https://tac.blockscout.com/api',
    },
    native: {
      name: 'TAC Explorer',
      url: 'https://explorer.tac.build',
      apiUrl: 'https://explorer.tac.build/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
