import * as Chain from '../../core/Chain.js'

export const coreDao = /*#__PURE__*/ Chain.from({
  id: 1116,
  name: 'Core Dao',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.coredao.org'] },
  },
  blockExplorers: {
    default: {
      name: 'CoreDao',
      url: 'https://scan.coredao.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11_907_934,
    },
  },
  testnet: false,
})
