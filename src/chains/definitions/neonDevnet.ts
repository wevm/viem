import * as Chain from '../../core/Chain.js'

export const neonDevnet = /*#__PURE__*/ Chain.from({
  id: 245_022_926,
  name: 'Neon EVM DevNet',
  nativeCurrency: { name: 'NEON', symbol: 'NEON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://devnet.neonevm.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Neonscan',
      url: 'https://devnet.neonscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 205206112,
    },
  },
  testnet: true,
})
