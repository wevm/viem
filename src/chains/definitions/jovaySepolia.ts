import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const jovaySepolia = /*#__PURE__*/ Chain.from({
  id: 2_019_775,
  name: 'Jovay Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://api.zan.top/public/jovay-testnet',
  },
  blockExplorers: {
    name: 'Jovay Testnet Explorer',
    url: 'https://sepolia-explorer.jovay.io/l2',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
