import { defineChain } from '../../utils/chain/defineChain.js'

export const electroneumTestnet = /*#__PURE__*/ defineChain({
  id: 5201420,
  name: 'Electroneum Testnet',
  nativeCurrency: {
    name: 'ETN',
    symbol: 'ETN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.electroneum.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Electroneum Block Explorer',
      url: 'https://blockexplorer.thesecurityteam.rocks',
    },
  },
  testnet: true,
})
