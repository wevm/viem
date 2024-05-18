import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const funkiSepolia = defineChain({
  ...chainConfig,
  id: 3397901,
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
