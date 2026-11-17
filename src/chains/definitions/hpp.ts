import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hpp = /*#__PURE__*/ Chain.from({
  id: 190415,
  name: 'HPP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet.hpp.io',
    ws: 'wss://mainnet.hpp.io',
  },
  blockExplorers: {
    name: 'HPP Mainnet Explorer',
    url: 'https://explorer.hpp.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
