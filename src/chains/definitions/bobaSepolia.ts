import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const bobaSepolia = /*#__PURE__*/ Chain.from({
  id: 28882,
  name: 'Boba Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: { http: 'https://sepolia.boba.network' },
  blockExplorers: {
    name: 'BOBAScan',
    url: 'https://testnet.bobascan.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
