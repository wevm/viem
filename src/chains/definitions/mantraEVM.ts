import * as Chain from '../../core/Chain.js'

export const mantraEVM = /*#__PURE__*/ Chain.from({
  id: 5888,
  name: 'MANTRA EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'MANTRA',
    symbol: 'MANTRA',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.mantrachain.io'],
      webSocket: ['https://evm.mantrachain.io/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MANTRA Blockscout Explorer',
      url: 'https://blockscout.mantrascan.io',
    },
  },
})
