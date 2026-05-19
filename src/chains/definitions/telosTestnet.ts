import * as Chain from '../../core/Chain.js'

export const telosTestnet = /*#__PURE__*/ Chain.define({
  id: 41n,
  name: 'Telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.telos.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan (testnet)',
      url: 'https://testnet.teloscan.io/',
    },
  },
  testnet: true,
})
