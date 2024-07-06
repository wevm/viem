import { defineChain } from '../../utils/chain/defineChain.js'

export const altarTestnet = /*#__PURE__*/ defineChain({
  id: 444444,
  name: 'Altar Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://altar-rpc.ceremonies.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'Altar Explorer',
      url: 'https://altar-explorer.ceremonies.ai/',
      apiUrl: 'https://altar-explorer.ceremonies.ai/api/v2/',
    },
  },
  testnet: true,
})
