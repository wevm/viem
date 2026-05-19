import * as Chain from '../../core/Chain.js'

export const canto = /*#__PURE__*/ Chain.define({
  id: 7_700n,
  name: 'Canto',
  nativeCurrency: {
    decimals: 18,
    name: 'Canto',
    symbol: 'CANTO',
  },
  rpcUrls: {
    default: { http: ['https://canto.gravitychain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Tuber.Build (Blockscout)',
      url: 'https://tuber.build',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2905789,
    },
  },
})
