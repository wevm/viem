import * as Chain from '../../core/Chain.js'

export const wemixTestnet = /*#__PURE__*/ Chain.define({
  id: 1112n,
  name: 'WEMIX Testnet',
  network: 'wemix-testnet',
  nativeCurrency: { name: 'WEMIX', symbol: 'tWEMIX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.test.wemix.com'] },
  },
  blockExplorers: {
    default: {
      name: 'wemixExplorer',
      url: 'https://testnet.wemixscan.com',
      apiUrl: 'https://testnet.wemixscan.com/api',
    },
  },
  testnet: true,
})
