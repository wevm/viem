import * as Chain from '../../core/Chain.js'

export const zilliqa = /*#__PURE__*/ Chain.from({
  id: 32769,
  name: 'Zilliqa',
  nativeCurrency: { name: 'Zilliqa', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zilliqa.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ethernal',
      url: 'https://evmx.zilliqa.com',
    },
  },
  testnet: false,
})
