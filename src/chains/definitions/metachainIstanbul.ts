import { defineChain } from '../../utils/chain/defineChain.js'

export const metachainIstanbul = /*#__PURE__*/ defineChain({
  id: 1_453,
  name: 'MetaChain Istanbul',
  nativeCurrency: { name: 'Metatime Coin', symbol: 'MTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://istanbul-rpc.metachain.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MetaExplorer',
      url: 'https://istanbul-explorer.metachain.dev',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0000000000000000000000000000000000003001',
      blockCreated: 0,
    },
  },
  testnet: true,
})
