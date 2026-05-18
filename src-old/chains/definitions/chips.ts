import { defineChain } from '../../utils/chain/defineChain.js'

export const chips = /*#__PURE__*/ defineChain({
  id: 2882,
  name: 'Chips Network',
  network: 'CHIPS',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA',
    symbol: 'IOTA',
  },
  rpcUrls: {
    default: {
      http: [
        'https://node.chips.ooo/wasp/api/v1/chains/iota1pp3d3mnap3ufmgqnjsnw344sqmf5svjh26y2khnmc89sv6788y3r207a8fn/evm',
      ],
    },
  },
})
