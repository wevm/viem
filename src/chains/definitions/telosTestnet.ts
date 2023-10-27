import { defineChain } from '../../utils/chain/defineChain.js'

export const telosTestnet = /*#__PURE__*/ defineChain({
  id: 41,
  name: 'Telos',
  network: 'telosTestnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: {
    default: { http: ['https://testnet.telos.net/evm'] },
    public: { http: ['https://testnet.telos.net/evm'] },
  },
  blockExplorers: {
    default: {
      name: 'Teloscan (testnet)',
      url: 'https://testnet.teloscan.io/',
    },
  },
  testnet: true,
})
