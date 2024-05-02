import { defineChain } from '../../utils/chain/defineChain.js'

export const otimDevnet = /*#__PURE__*/ defineChain({
  id: 41144114,
  name: 'Otim Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://devnet.otim.xyz'],
    },
  },
  contracts: {
    baseInvoker: {
      address: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    },
  },
})
