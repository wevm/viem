import * as Chain from '../../core/Chain.js'

export const otimDevnet = /*#__PURE__*/ Chain.define({
  id: 41144114n,
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
  testnet: true,
})
