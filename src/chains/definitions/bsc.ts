import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const bsc = /*#__PURE__*/ Chain.from({
  id: 56,
  name: 'BNB Smart Chain',
  blockTime: 750,
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: { http: 'https://56.rpc.thirdweb.com' },
  blockExplorers: {
    name: 'BscScan',
    url: 'https://bscscan.com',
    apiUrl: 'https://api.bscscan.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15921452,
    },
  },
})
