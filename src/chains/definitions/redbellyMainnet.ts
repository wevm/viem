import { defineChain } from '../../utils/chain/defineChain.js'

export const redbellyMainnet = /*#__PURE__*/ defineChain({
  id: 151,
  name: 'Redbelly Network Mainnet',
  nativeCurrency: {
    name: 'Redbelly Native Coin',
    symbol: 'RBNT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://governors.mainnet.redbelly.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Routescan',
      url: 'https://redbelly.routescan.io',
      apiUrl:
        'https://api.routescan.io/v2/network/mainnet/evm/151/etherscan/api',
    },
  },
  testnet: false,
})
