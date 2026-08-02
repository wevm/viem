import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const fantom = /*#__PURE__*/ Chain.from({
  id: 250,
  name: 'Fantom',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: { http: 'https://250.rpc.thirdweb.com' },
  blockExplorers: {
    name: 'FTMScan',
    url: 'https://ftmscan.com',
    apiUrl: 'https://api.ftmscan.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 33001987,
    },
  },
})
