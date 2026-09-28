import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const coreDao = /*#__PURE__*/ Chain.from({
  id: 1116,
  name: 'Core Dao',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
  },
  rpcUrls: { http: 'https://rpc.coredao.org' },
  blockExplorers: {
    name: 'CoreDao',
    url: 'https://scan.coredao.org',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11_907_934,
    },
  },
  testnet: false,
})
