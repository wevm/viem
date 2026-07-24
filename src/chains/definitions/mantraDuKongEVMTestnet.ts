import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const mantraDuKongEVMTestnet = /*#__PURE__*/ Chain.from({
  id: 5887,
  name: 'MANTRA DuKong EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MANTRA',
    symbol: 'MANTRA',
  },
  rpcUrls: { http: 'https://evm.dukong.mantrachain.io' },
  blockExplorers: {
    name: 'MANTRAScan',
    url: 'https://mantrascan.io/dukong',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
