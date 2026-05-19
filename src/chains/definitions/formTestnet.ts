import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const formTestnet = /*#__PURE__*/ Chain.define({
  id: 132_902n,
  name: 'Form Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.form.network/http'],
      webSocket: ['wss://sepolia-rpc.form.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Form Testnet Explorer',
      url: 'https://sepolia-explorer.form.network',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    addressManager: {
      [sourceId.toString()]: {
        address: '0xd5C38fa934f7fd7477D4800F4f38a1c5BFdF1373',
      },
    },
    l1CrossDomainMessenger: {
      [sourceId.toString()]: {
        address: '0x37A68565c4BE9700b3E3Ec60cC4416cAC3052FAa',
      },
    },
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x9eA2239E65a59EC9C7F1ED4C116dD58Da71Fc1e2',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x60377e3cE15dF4CCA24c4beF076b60314240b032',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xD4531f633942b2725896F47cD2aFd260b44Ab1F7',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: true,
  sourceId,
})
