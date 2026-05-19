import * as Chain from '../../core/Chain.js'

export const citrea = /*#__PURE__*/ Chain.define({
  id: 4114n,
  name: 'Citrea Mainnet',
  nativeCurrency: { name: 'Citrea Bitcoin', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.citrea.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.mainnet.citrea.xyz',
      apiUrl: 'https://explorer.mainnet.citrea.xyz/api',
    },
  },
  testnet: false,
})
