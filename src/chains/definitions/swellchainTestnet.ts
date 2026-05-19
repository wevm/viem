import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

export const swellchainTestnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1924n,
  name: 'Swellchain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://swell-testnet.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Swellchain Testnet Explorer',
      url: 'https://swell-testnet-explorer.alt.technology',
      apiUrl: 'https://swell-testnet-explorer.alt.technology/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  testnet: true,
})
