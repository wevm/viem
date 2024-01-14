import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../celo/chainConfig.js'

export const celoAlfajores = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 44_787,
  name: 'Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'A-CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://explorer.celo.org/alfajores',
      apiUrl: 'https://explorer.celo.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14569001,
    },
  },
  testnet: true,
})
