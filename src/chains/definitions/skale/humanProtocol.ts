import { defineChain } from '../../../utils/chain/defineChain.js'

export const skaleHumanProtocol = /*#__PURE__*/ defineChain({
  id: 1_273_227_453,
  name: 'SKALE | Human Protocol',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.skalenodes.com/v1/wan-red-ain'],
      webSocket: ['wss://mainnet.skalenodes.com/v1/ws/wan-red-ain'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SKALE Explorer',
      url: 'https://wan-red-ain.explorer.mainnet.skalenodes.com',
    },
  },
  contracts: {},
})
