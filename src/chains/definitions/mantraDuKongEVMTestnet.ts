import { defineChain } from '../../utils/chain/defineChain.js'

export const mantraDuKongEVMTestnet = /*#__PURE__*/ defineChain({
  id: 5887,
  name: 'MANTRA DuKong EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OM',
    symbol: 'OM',
  },
  rpcUrls: {
    default: { http: ['https://evm.dukong.mantrachain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'MANTRAScan',
      url: 'https://mantrascan.io/dukong',
    },
  },
  testnet: true,
})
