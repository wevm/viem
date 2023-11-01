import { defineChain } from '../../utils/chain/defineChain.js'

export const qTestnet = /*#__PURE__*/ defineChain({
  id: 35443,
  name: 'Q Testnet',
  network: 'q-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Q',
    symbol: 'Q',
  },
  rpcUrls: {
    default: { http: ['https://rpc.qtestnet.org'] },
    public: { http: ['https://rpc.qtestnet.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Q Testnet Explorer',
      url: 'https://explorer.qtestnet.org',
    },
  },
  testnet: true,
})
