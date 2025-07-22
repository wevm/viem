import { defineChain } from '../../utils/chain/defineChain.js'

export const henesys = /*#__PURE__*/ defineChain({
  id: 68414,
  name: 'Henesys',
  network: 'Henesys',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexpace',
    symbol: 'NXPC'
  },
  rpcUrls: {
    default: { http: ['https://henesys-rpc.msu.io'] },
    public: { http: ['https://henesys-rpc.msu.io'] }
  },
  blockExplorers: {
    default: {
      name: 'MSU Explorer',
      url: 'https://msu-explorer.xangle.io',
    },
  },
  testnet: false,
})
