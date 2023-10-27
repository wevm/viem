import { defineChain } from '../../utils/chain/defineChain.js'
import { formattersCelo } from '../celo/formatters.js'
import { serializersCelo } from '../celo/serializers.js'

export const celo = /*#__PURE__*/ defineChain(
  {
    id: 42_220,
    name: 'Celo',
    network: 'celo',
    nativeCurrency: {
      decimals: 18,
      name: 'CELO',
      symbol: 'CELO',
    },
    rpcUrls: {
      default: { http: ['https://forno.celo.org'] },
      infura: {
        http: ['https://celo-mainnet.infura.io/v3'],
      },
      public: {
        http: ['https://forno.celo.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Celo Explorer',
        url: 'https://explorer.celo.org/mainnet',
      },
      etherscan: { name: 'CeloScan', url: 'https://celoscan.io' },
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
