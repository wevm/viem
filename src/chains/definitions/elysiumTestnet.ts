import * as Chain from '../../core/Chain.js'

export const elysiumTestnet = /*#__PURE__*/ Chain.from({
  id: 1338,
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
