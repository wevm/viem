import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersCelo } from '../celo/formatters.js'
import { serializersCelo } from '../celo/serializers.js'

export const celoCannoli = /*#__PURE__*/ defineChain(
  {
    id: 17_323,
    name: 'Cannoli',
    network: 'celo-cannoli',
    nativeCurrency: {
      decimals: 18,
      name: 'CELO',
      symbol: 'C-CELO',
    },
    rpcUrls: {
      default: {
        http: ['https://forno.cannoli.celo-testnet.org'],
      },
      public: {
        http: ['https://forno.cannoli.celo-testnet.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Celo Explorer',
        url: 'https://explorer.celo.org/cannoli',
      },
    },
    contracts: {
      multicall3: {
        address: '0x5Acb0aa8BF4E8Ff0d882Ee187140713C12BF9718',
        blockCreated: 87429,
      },
    },
    testnet: true,
  },
  {
    formatters: formattersCelo,
    serializers: serializersCelo,
  },
)
