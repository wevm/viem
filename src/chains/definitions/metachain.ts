import { defineChain } from '../../utils/chain/defineChain.js'

export const metachain = /*#__PURE__*/ defineChain({
  id: 571,
  name: 'MetaChain Mainnet',
  nativeCurrency: { name: 'Metatime Coin', symbol: 'MTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.metatime.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MetaExplorer',
      url: 'https://explorer.metatime.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0000000000000000000000000000000000003001',
      blockCreated: 0,
    },
  },
})
