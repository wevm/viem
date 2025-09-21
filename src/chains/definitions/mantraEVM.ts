import { defineChain } from '../../utils/chain/defineChain.js'

export const mantraEVM = /*#__PURE__*/ defineChain({
  id: 5888,
  name: 'MANTRA EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'OM',
    symbol: 'OM',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.mantrachain.io'],
      webSocket: ['https://evm.mantrachain.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MANTRA Scan',
      url: 'https://mantrascan.io/mainnet',
    },
  },
})
