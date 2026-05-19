import * as Chain from '../../core/Chain.js'

export const wemix = /*#__PURE__*/ Chain.define({
  id: 1111n,
  name: 'WEMIX',
  network: 'wemix-mainnet',
  nativeCurrency: { name: 'WEMIX', symbol: 'WEMIX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.wemix.com'] },
  },
  blockExplorers: {
    default: {
      name: 'wemixExplorer',
      url: 'https://explorer.wemix.com',
    },
  },
})
