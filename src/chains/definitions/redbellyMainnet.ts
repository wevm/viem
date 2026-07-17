import * as Chain from '../../core/Chain.js'

export const redbellyMainnet = /*#__PURE__*/ Chain.from({
  id: 151,
  name: 'Redbelly Network Mainnet',
  nativeCurrency: {
    name: 'Redbelly Native Coin',
    symbol: 'RBNT',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://governors.mainnet.redbelly.network',
  },
  blockExplorers: {
    name: 'Routescan',
    url: 'https://redbelly.routescan.io',
    apiUrl: 'https://api.routescan.io/v2/network/mainnet/evm/151/etherscan/api',
  },
  testnet: false,
})
