import * as Chain from '../../core/Chain.js'

export const oasisTestnet = /*#__PURE__*/ Chain.from({
  id: 4090,
  name: 'Oasis Testnet',
  nativeCurrency: { name: 'Fasttoken', symbol: 'FTN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc1.oasis.bahamutchain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Ftnscan',
      url: 'https://oasis.ftnscan.com',
      apiUrl: 'https://oasis.ftnscan.com/api',
    },
  },
  testnet: true,
})
