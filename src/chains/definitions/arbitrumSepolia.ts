import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const arbitrumSepolia = /*#__PURE__*/ Chain.from({
  id: 421_614,
  name: 'Arbitrum Sepolia',
  blockTime: 250,
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://sepolia-rollup.arbitrum.io/rpc',
  },
  blockExplorers: {
    name: 'Arbiscan',
    url: 'https://sepolia.arbiscan.io',
    apiUrl: 'https://api-sepolia.arbiscan.io/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 81930,
    },
  },
  testnet: true,
})
