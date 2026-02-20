import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const gensyn = /*#__PURE__*/ defineChain({
  id: 685_689,
  name: 'Gensyn Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://gensyn-mainnet.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://ddrg456.explorer.alchemy.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  sourceId,
})
