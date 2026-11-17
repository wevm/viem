import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const mantraEVM = /*#__PURE__*/ Chain.from({
  id: 5888,
  name: 'MANTRA EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'MANTRA',
    symbol: 'MANTRA',
  },
  rpcUrls: {
    http: 'https://evm.mantrachain.io',
    ws: 'https://evm.mantrachain.io/ws',
  },
  blockExplorers: {
    name: 'MANTRA Blockscout Explorer',
    url: 'https://blockscout.mantrascan.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
