import { defineChain } from '../../utils/chain/defineChain.js'

export const enuls = /*#__PURE__*/ defineChain({
  id: 119,
  name: 'ENULS Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'NULS',
    symbol: 'NULS',
  },
  rpcUrls: {
    default: { http: ['https://evmapi2.nuls.io'] },
  },
  blockExplorers: {
    default: {
      name: 'ENULS Explorer',
      url: 'https://evmscan.nuls.io',
    },
  },
  testnet: false,
})
