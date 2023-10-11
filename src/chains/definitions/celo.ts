import { defineChain } from '../../utils/chain.js'
import { formattersCelo } from '../celo/formatters.js'
import { serializersCelo } from '../celo/serializers.js'

export const celo = /*#__PURE__*/ defineChain(
  {
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
      },
    },
    contracts: {
      multicall3: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        blockCreated: 13112599,
      },
    },
    testnet: false,
  },
  {
    formatters: formattersCelo,
    serializers: serializersCelo,
  },
)
