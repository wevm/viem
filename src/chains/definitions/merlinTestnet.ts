import { defineChain } from '../../utils/chain/defineChain.js'

export const merlinTestnet = /*#__PURE__*/ defineChain({
  id: 686868,
  name: 'Merlin Testnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.merlinchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Merlin Testnet Explorer',
      url: 'https://testnet-scan.merlinchain.io',
      apiUrl: 'https://testnet-scan.merlinchain.io/api',
    },
  },
  testnet: true,
})
