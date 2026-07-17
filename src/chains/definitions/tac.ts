import * as Chain from '../../core/Chain.js'

export const tac = /*#__PURE__*/ Chain.from({
  id: 239,
  name: 'TAC',
  nativeCurrency: { name: 'TAC', symbol: 'TAC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.ankr.com/tac',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://tac.blockscout.com',
    apiUrl: 'https://tac.blockscout.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
})
