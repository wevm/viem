import { defineChain } from '../../utils/chain/defineChain.js'

export const luxeports = /*#__PURE__*/ defineChain({
  id: 1122,
  name: 'LuxePorts',
  network: 'luxeports',
  nativeCurrency: {
    name: 'LuxePorts',
    symbol: 'LXP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.luxeports.com'],
    },
    public: {
      http: ['https://rpc.luxeports.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'lxpscan',
      url: 'https://lxpscan.com',
    },
  },
  testnet: false,
})

