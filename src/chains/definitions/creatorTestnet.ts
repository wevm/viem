import { defineChain } from '../../utils/chain/defineChain.js'

export const creatorTestnet = /*#__PURE__*/ defineChain({
  id: 66665,
  name: 'Creator',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.creatorchain.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.creatorchain.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: true,
})
