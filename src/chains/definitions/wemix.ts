import * as Chain from '../../core/Chain.js'

export const wemix = /*#__PURE__*/ Chain.from({
  id: 1111,
  name: 'WEMIX',
  nativeCurrency: { name: 'WEMIX', symbol: 'WEMIX', decimals: 18 },
  rpcUrls: { http: 'https://api.wemix.com' },
  blockExplorers: {
    name: 'wemixExplorer',
    url: 'https://explorer.wemix.com',
  },
})
