import * as Chain from '../../core/Chain.js'

export const berachainTestnet = /*#__PURE__*/ Chain.define({
  id: 80085n,
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
