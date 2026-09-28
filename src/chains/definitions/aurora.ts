import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const aurora = /*#__PURE__*/ Chain.from({
  id: 1313161554,
  name: 'Aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://mainnet.aurora.dev' },
  blockExplorers: {
    name: 'Aurorascan',
    url: 'https://aurorascan.dev',
    apiUrl: 'https://aurorascan.dev/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 62907816,
    },
  },
})
