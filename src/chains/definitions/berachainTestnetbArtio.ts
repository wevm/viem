import { defineChain } from '../../utils/chain/defineChain.js'

export const berachainTestnetbArtio = /*#__PURE__*/ defineChain({
  id: 80084,
  name: 'Berachain bArtio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
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
