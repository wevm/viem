import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

const sourceId = 11_155_111n // sepolia

export const funkiSepolia = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 3397901n,
  network: 'funkiSepolia',
  name: 'Funki Sepolia Sandbox',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://funki-testnet.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Funki Sepolia Sandbox Explorer',
      url: 'https://sepolia-sandbox.funkichain.com/',
    },
  },
  testnet: true,
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1620204,
    },
  },
  sourceId,
})
