import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const redbellyTestnet = /*#__PURE__*/ Chain.from({
  id: 153,
  name: 'Redbelly Network Testnet',
  nativeCurrency: {
    name: 'Redbelly Native Coin',
    symbol: 'RBNT',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://governors.testnet.redbelly.network',
  },
  blockExplorers: {
    name: 'Routescan',
    url: 'https://redbelly.testnet.routescan.io',
    apiUrl:
      'https://api.routescan.io/v2/network/testnet/evm/153_2/etherscan/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
