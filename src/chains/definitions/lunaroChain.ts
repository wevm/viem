import { defineChain } from '../../utils/chain/defineChain.js'

export const lunaroChain = /*#__PURE__*/ defineChain({
  id: 389,
  name: 'LunaroChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Lunaro',
    symbol: 'LNR',
  },
  rpcUrls: {
    default: { http: ['https://rpc.lunaro.network'] },
  },
  blockExplorers: {
    default: {
      name: 'LunaroScan',
      url: 'https://scan.lunaro.network',
    },
  },
  testnet: false,
})
