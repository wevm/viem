import { defineChain } from '../../utils/chain/defineChain.js'

export const ziliqa = /*#__PURE__*/ defineChain({
  id: 32769,
  name: 'Ziliqa',
  network: 'ziliqa',
  nativeCurrency: { name: 'Ziliqa', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.zilliqa.com'],
    },
    public: {
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
