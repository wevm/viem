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
    public: {
      http: ['https://neon-proxy-mainnet.solana.p2p.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Neonscan',
      url: 'https://neonscan.org',
    },
  },
  contracts: {},
  testnet: false,
})
