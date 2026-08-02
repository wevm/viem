import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

export const swellchain = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 1923,
  name: 'Swellchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://swell-mainnet.alt.technology',
  },
  blockExplorers: {
    name: 'Swell Explorer',
    url: 'https://explorer.swellnetwork.io',
    apiUrl: 'https://explorer.swellnetwork.io/api',
  },
  contracts: {
    ...chainConfig.contracts,
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
})
