import { defineChain } from '../../utils/chain/defineChain.js'

export const genesys = /*#__PURE__*/ defineChain({
  id: 16507,
  name: 'Genesys Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'GSYS',
    symbol: 'GSYS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.genesys.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Genesys Explorer',
      url: 'https://gchainexplorer.genesys.network',
    },
  },
  testnet: false,
})
