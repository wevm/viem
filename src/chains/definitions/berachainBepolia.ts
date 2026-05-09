import { defineChain } from '../../utils/chain/defineChain.js'

export const berachainBepolia = /*#__PURE__*/ defineChain({
  id: 80069,
  blockTime: 2_000,
  name: 'Berachain Bepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  rpcUrls: {
    default: { http: ['https://bepolia.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berascan',
      url: 'https://bepolia.beratrail.io',
    },
  },
  testnet: true,
})
