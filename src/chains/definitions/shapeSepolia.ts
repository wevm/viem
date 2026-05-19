import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const shapeSepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 11_011n,
  name: 'Shape Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.shape.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer-sepolia.shape.network/',
      apiUrl: 'https://explorer-sepolia.shape.network/api/v2',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  testnet: true,
  sourceId,
})
