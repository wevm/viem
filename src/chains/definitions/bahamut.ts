import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const bahamut = /*#__PURE__*/ Chain.from({
  id: 5165,
  name: 'Bahamut',
  nativeCurrency: { name: 'Fasttoken', symbol: 'FTN', decimals: 18 },
  rpcUrls: {
    http: [
      'https://rpc1.bahamut.io',
      'https://bahamut-rpc.publicnode.com',
      'https://rpc2.bahamut.io',
    ],
    ws: [
      'wss://ws1.sahara.bahamutchain.com',
      'wss://bahamut-rpc.publicnode.com',
      'wss://ws2.sahara.bahamutchain.com',
    ],
  },
  blockExplorers: {
    name: 'Ftnscan',
    url: 'https://www.ftnscan.com',
    apiUrl: 'https://www.ftnscan.com/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
})
