import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const whitechainSepolia = /*#__PURE__*/ Chain.from({
  testnet: true,
  id: 1874,
  name: 'Whitechain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'WBT',
    symbol: 'WBT',
  },
  rpcUrls: {
    http: 'https://rpc.testnet.whitechain.io',
  },
  blockExplorers: {
    name: 'Whitechain Testnet Explorer',
    url: 'https://explorer.testnet.whitechain.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
