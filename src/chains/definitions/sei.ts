import * as Chain from '../../core/Chain.js'

export const sei = /*#__PURE__*/ Chain.from({
  id: 1329,
  name: 'Sei Network',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    http: 'https://evm-rpc.sei-apis.com/',
    ws: 'wss://evm-ws.sei-apis.com/',
  },
  blockExplorers: {
    name: 'Seiscan',
    url: 'https://seiscan.io',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
