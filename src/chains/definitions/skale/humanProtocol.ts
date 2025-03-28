import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleHumanProtocol = /*#__PURE__*/ defineChain({
  id: 1_273_227_453,
  name: 'SKALE | Human Protocol',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [],
      webSocket: [],
    },
  },
  blockExplorers: {},
  contracts: {},
})

