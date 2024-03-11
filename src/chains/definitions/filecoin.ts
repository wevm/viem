import { defineChain } from '../../utils/chain/defineChain.js'

export const filecoin = /*#__PURE__*/ defineChain({
  id: 314,
  name: 'Filecoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'filecoin',
    symbol: 'FIL',
  },
  rpcUrls: {
    default: { http: ['https://api.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: {
      name: 'Filfox',
      url: 'https://filfox.info/en',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3328594,
    },
  },
})
