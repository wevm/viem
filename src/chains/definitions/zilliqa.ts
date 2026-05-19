import * as Chain from '../../core/Chain.js'

export const zilliqa = /*#__PURE__*/ Chain.define({
  id: 32769n,
  name: 'Zilliqa',
  network: 'zilliqa',
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
