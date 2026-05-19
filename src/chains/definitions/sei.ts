import * as Chain from '../../core/Chain.js'

export const sei = /*#__PURE__*/ Chain.define({
  id: 1329n,
  name: 'Sei Network',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.sei-apis.com/'],
      webSocket: ['wss://evm-ws.sei-apis.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seiscan',
      url: 'https://seiscan.io',
      apiUrl: 'https://api.etherscan.io/v2/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
