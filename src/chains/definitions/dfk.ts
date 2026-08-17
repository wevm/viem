import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const dfk = /*#__PURE__*/ Chain.from({
  id: 53_935,
  name: 'DFK Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Jewel',
    symbol: 'JEWEL',
  },
  rpcUrls: {
    http: 'https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc',
  },
  blockExplorers: {
    name: 'DFKSubnetScan',
    url: 'https://subnets.avax.network/defi-kingdoms',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14790551,
    },
  },
})
