import * as Chain from '../../core/Chain.js'

export const citreaTestnet = /*#__PURE__*/ Chain.from({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: { name: 'cBTC', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.citrea.xyz',
  },
  blockExplorers: {
    name: 'Citrea Explorer',
    url: 'https://explorer.testnet.citrea.xyz',
    apiUrl: 'https://explorer.testnet.citrea.xyz/api',
  },
  testnet: true,
})
