import { defineChain } from '../../utils/chain/defineChain.js'

export const wemix = /*#__PURE__*/ defineChain({
  id: 1111,
  name: 'WEMIX',
  network: 'wemix-mainnet',
  nativeCurrency: { name: 'WEMIX', symbol: 'WEMIX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.wemix.com'] },
    public: { http: ['https://api.wemix.com'] },
  },
  blockExplorers: {
    default: {
      name: 'wemixExplorer',
      url: 'https://explorer.wemix.com',
    },
  },
})
