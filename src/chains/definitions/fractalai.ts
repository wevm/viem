import { defineChain } from '../../utils/chain/defineChain.js'

export const fractalai = /*#__PURE__*/ defineChain({
  id: 62124,
  name: 'FractalAI',
  nativeCurrency: {
    decimals: 18,
    name: 'Fractal',
    symbol: 'FRAC',
  },
  rpcUrls: {
    default: { http: ['https://api.fractalai.net.co'] },
  },
  blockExplorers: {
    default: {
      name: 'FractalAI Explorer',
      url: 'https://fractalai.net.co/explorer',
    },
  },
})
