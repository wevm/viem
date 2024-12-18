import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const ink = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 57073,
  name: 'Ink Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-gel.inkonchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.inkonchain.com',
    },
  },
  testnet: false,
})
