import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const lisk = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.lisk.com',
      apiUrl: 'https://blockscout.lisk.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xA9d71E1dd7ca26F26e656E66d6AA81ed7f745bf0',
    },
  },
})
