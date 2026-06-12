import { defineChain } from '../../utils/chain/defineChain.js'

export const neonMainnet = /*#__PURE__*/ defineChain({
  id: 245_022_934,
  network: 'neonMainnet',
  name: 'Neon EVM MainNet',
  nativeCurrency: { name: 'NEON', symbol: 'NEON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://neon-proxy-mainnet.solana.p2p.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Neonscan',
      url: 'https://neonscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 206545524,
    },
  },
  testnet: false,
})
