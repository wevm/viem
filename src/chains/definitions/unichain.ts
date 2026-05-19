import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const unichain = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 130n,
  name: 'Unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://mainnet.unichain.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://uniscan.xyz',
      apiUrl: 'https://api.uniscan.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId.toString()]: {
        address: '0x2F12d621a16e2d3285929C9996f478508951dFe4',
      },
    },
    portal: {
      [sourceId.toString()]: {
        address: '0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA',
      },
    },
  },
  sourceId,
})
