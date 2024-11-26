import { defineChain } from '../../utils/chain/defineChain.js'

export const berachainTestnetbArtio = /*#__PURE__*/ defineChain({
  id: 80084,
  name: 'Berachain bArtio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 109269,
    },
  },
  rpcUrls: {
    default: { http: ['https://bartio.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berachain bArtio Beratrail',
      url: 'https://bartio.beratrail.io',
    },
  },
  testnet: true,
})
