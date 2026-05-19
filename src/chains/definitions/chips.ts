import * as Chain from '../../core/Chain.js'

export const chips = /*#__PURE__*/ Chain.define({
  id: 2882n,
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
