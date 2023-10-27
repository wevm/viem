import { defineChain } from '../../utils/chain/defineChain.js'

export const haqqMainnet = /*#__PURE__*/ defineChain({
  id: 11235,
  name: 'HAQQ Mainnet',
  network: 'haqq-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Islamic Coin',
    symbol: 'ISLM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.eth.haqq.network'],
    },
    public: {
      http: ['https://rpc.eth.haqq.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HAQQ Explorer',
      url: 'https://explorer.haqq.network',
    },
  },
})
