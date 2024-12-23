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
    ensRegistry: {
      address: '0xB0eef18971290b333450586D33dcA6cE122651D2',
      blockCreated: 7736794,
    },
    ensUniversalResolver: {
      address: '0x41692Ef1EA0C79E6b73077E4A67572D2BDbD7057',
      blockCreated: 7736795,
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
