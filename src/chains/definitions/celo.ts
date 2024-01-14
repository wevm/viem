import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../celo/chainConfig.js'

export const celo = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42_220,
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
      url: 'https://explorer.celo.org/mainnet',
      apiUrl: 'https://explorer.celo.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13112599,
    },
  },
  testnet: false,
})
