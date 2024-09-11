import { chainConfig } from '../../celo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia 

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
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14569001,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x831f39053688f05698ad0fB5f4DE7e56B2949c55',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x419577592C884868C3ed85B97169b93362581855',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xB29597c6866c6C2870348f1035335B75eEf79d07',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x9FEBd0F16b97e0AEF9151AF07106d733E87B1be4',
      },
    },
  },
  testnet: true,
})
