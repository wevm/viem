import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../zksync/chainConfig.js'

export const zkSyncSepoliaTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 300,
  name: 'zkSync Sepolia Testnet',
  network: 'zksync-sepolia-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.era.zksync.dev'],
      webSocket: ['wss://sepolia.era.zksync.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkExplorer',
      url: 'https://sepolia.explorer.zksync.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
  testnet: true,
})
