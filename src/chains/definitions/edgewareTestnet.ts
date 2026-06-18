import * as Chain from '../../core/Chain.js'

export const edgewareTestnet = /*#__PURE__*/ Chain.from({
  id: 2022,
  name: 'Beresheet BereEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet EDG',
    symbol: 'tEDG',
  },
  rpcUrls: {
    default: { http: ['https://beresheet-evm.jelliedowl.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Edgscan by Bharathcoorg',
      url: 'https://testnet.edgscan.live',
      apiUrl: 'https://testnet.edgscan.live/api',
    },
  },
  testnet: true,
})
