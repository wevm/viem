import { defineChain } from '../../utils/chain/defineChain.js'

export const berachainTestnet = /*#__PURE__*/ defineChain({
  id: 80085,
  name: 'Berachain Artio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: { http: ['https://artio.rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berachain',
      url: 'https://artio.beratrail.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 866924,
    },
  },
  testnet: true,
})
