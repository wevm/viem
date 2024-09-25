import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'


export const elysiumTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1338,
  name: 'Elysium Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LAVA',
    symbol: 'LAVA',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.atlantischain.network/','https://elysium-test-rpc.vulcanforged.com'],
      webSocket: ['wss://atlantischain.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elysium testnet explorer',
      url: 'https://blockscout.atlantischain.network/'
    },
  },
  testnet: true,
})
