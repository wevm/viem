import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const neonMainnet = /*#__PURE__*/ Chain.from({
  id: 245_022_934,
  name: 'Neon EVM MainNet',
  nativeCurrency: { name: 'NEON', symbol: 'NEON', decimals: 18 },
  rpcUrls: {
    http: 'https://neon-proxy-mainnet.solana.p2p.org',
  },
  blockExplorers: {
    name: 'Neonscan',
    url: 'https://neonscan.org',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 206545524,
    },
  },
  testnet: false,
})
