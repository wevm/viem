import { contracts } from '../../op-stack/chainConfig.js'
import * as Chain from '../../core/Chain.js'

export const celo = /*#__PURE__*/ Chain.define({
  blockTime: 1_000,
  id: 42_220n,
  name: 'Celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://forno.celo.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://celoscan.io',
      apiUrl: 'https://api.celoscan.io/api',
    },
  },
  contracts: {
    ...contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13112599,
    },
  },
  testnet: false,
})
