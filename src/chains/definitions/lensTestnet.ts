import { defineChain } from '../../utils/chain/defineChain.js'

export const lensTestnet = /*#__PURE__*/ defineChain({
  id: 37_111,
  name: 'Lens Testnet',
  nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.lens.dev'],
      webSocket: ['wss://rpc.testnet.lens.dev/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lens Block Explorer',
      url: 'https://block-explorer.testnet.lens.dev',
      apiUrl: 'https://block-explorer-api.staging.lens.dev/api',
    },
  },
  testnet: true,
})
