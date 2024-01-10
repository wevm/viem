import { defineChain } from '../../utils/chain/defineChain.js'

export const zilliqa = /*#__PURE__*/ defineChain({
  id: 32769,
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
