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
    celoscan: {
      name: 'CeloScan',
      url: 'https://alfajores.celoscan.io/',
      apiUrl: 'https://api-alfajores.celoscan.io/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14569001,
    },
    portal: {
      [sourceId]: {
        address: '0x969d247cB586C0bF02212B9ae6e690e8b0d762bA',
      },
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0xB0C46509E24a0745d201114016fD666D6D1E3f8e',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x58eeeEC56C6e92b1898367fa7372ab3f6483F054',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x65E8f629B13535f902020668Fe73aEc24e52F5D8',
      },
    },
    l2StandardBridge: {
      [sourceId]: {
        address: '0x4200000000000000000000000000000000000010',
      },
    },
  },
  testnet: true,
})
