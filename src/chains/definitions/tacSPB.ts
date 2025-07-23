import { defineChain } from '../../utils/chain/defineChain.js'

export const tacSPB = /*#__PURE__*/ defineChain({
  id: 2_391,
  name: 'TAC SPB Testnet',
  nativeCurrency: {
    name: 'TAC',
    symbol: 'TAC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://spb.rpc.tac.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TAC',
      url: 'https://spb.explorer.tac.build',
      apiUrl: 'https://spb.explorer.tac.build/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 471429,
    },
  },
  testnet: true,
})
