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
    batchInvoker: {
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    },
  },
})
