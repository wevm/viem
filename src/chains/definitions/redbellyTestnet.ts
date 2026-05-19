import * as Chain from '../../core/Chain.js'

export const redbellyTestnet = /*#__PURE__*/ Chain.define({
  id: 153n,
  name: 'Redbelly Network Testnet',
  nativeCurrency: {
    name: 'Redbelly Native Coin',
    symbol: 'RBNT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://governors.testnet.redbelly.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Routescan',
      url: 'https://redbelly.testnet.routescan.io',
      apiUrl:
        'https://api.routescan.io/v2/network/testnet/evm/153_2/etherscan/api',
    },
  },
  testnet: true,
})
