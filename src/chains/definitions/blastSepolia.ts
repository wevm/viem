import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

const sourceId = 11_155_111 // sepolia

export const blastSepolia = /*#__PURE__*/ Chain.from({
  id: 168_587_773,
  name: 'Blast Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://sepolia.blast.io',
  },
  blockExplorers: {
    name: 'Blastscan',
    url: 'https://sepolia.blastscan.io',
    apiUrl: 'https://api-sepolia.blastscan.io/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 756690,
    },
  },
  testnet: true,
  sourceId,
})
