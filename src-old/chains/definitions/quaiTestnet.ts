import { defineChain } from '../../utils/chain/defineChain.js'

export const quaiTestnet = /*#__PURE__*/ defineChain({
  id: 15000,
  name: 'Quai Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Quai',
    symbol: 'QUAI',
  },
  rpcUrls: {
    default: { http: ['https://orchard.rpc.quai.network/cyprus1'] },
  },
  blockExplorers: {
    default: {
      name: 'Orchard Quaiscan',
      url: 'https://orchard.quaiscan.io',
      apiUrl: 'https://orchard.quaiscan.io/api',
    },
  },
  testnet: true,
})
