import * as Chain from '../../core/Chain.js'

export const quai = /*#__PURE__*/ Chain.from({
  id: 9,
  name: 'Quai Network Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Quai',
    symbol: 'QUAI',
  },
  rpcUrls: { http: 'https://rpc.quai.network/cyprus1' },
  blockExplorers: {
    name: 'Quaiscan',
    url: 'https://quaiscan.io',
    apiUrl: 'https://quaiscan.io/api',
  },
  testnet: false,
})
