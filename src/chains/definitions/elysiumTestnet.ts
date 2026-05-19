import { chainConfig } from '../internal/opStack.js'
import * as Chain from '../../core/Chain.js'

export const elysiumTestnet = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 1338n,
  name: 'Elysium Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'LAVA',
    symbol: 'LAVA',
  },
  rpcUrls: {
    default: {
      http: ['https://elysium-test-rpc.vulcanforged.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elysium testnet explorer',
      url: 'https://elysium-explorer.vulcanforged.com',
    },
  },
  testnet: true,
})
