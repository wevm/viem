import * as Chain from '../../core/Chain.js'

export const tacSPB = /*#__PURE__*/ Chain.from({
  id: 2_391,
  name: 'TAC SPB Testnet',
  nativeCurrency: {
    name: 'TAC',
    symbol: 'TAC',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://spb.rpc.tac.build',
  },
  blockExplorers: {
    name: 'TAC',
    url: 'https://spb.explorer.tac.build',
    apiUrl: 'https://spb.explorer.tac.build/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 471429,
    },
  },
  testnet: true,
})
