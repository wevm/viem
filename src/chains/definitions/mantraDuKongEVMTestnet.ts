import * as Chain from '../../core/Chain.js'

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
  testnet: true,
})
