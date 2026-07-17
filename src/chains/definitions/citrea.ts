import * as Chain from '../../core/Chain.js'

export const citrea = /*#__PURE__*/ Chain.from({
  id: 4114,
  name: 'Citrea Mainnet',
  nativeCurrency: { name: 'Citrea Bitcoin', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.mainnet.citrea.xyz',
  },
  blockExplorers: {
    name: 'Citrea Explorer',
    url: 'https://explorer.mainnet.citrea.xyz',
    apiUrl: 'https://explorer.mainnet.citrea.xyz/api',
  },
  testnet: false,
})
