
import { defineChain } from '../../utils/chain/defineChain.js'

export const defioraclemetaMainnet = /*#__PURE__*/ defineChain({
  id: 138,
  network: 'defioraclemeta Mainnet',
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: {
    name: 'ETHER',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.defi-oracle.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.defi-oracle.io',
    },
  },
})
