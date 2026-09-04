import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const jbc = /*#__PURE__*/ Chain.from({
  id: 8899,
  name: 'JB Chain',
  nativeCurrency: { name: 'JBC', symbol: 'JBC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-l1.jibchain.net',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://exp-l1.jibchain.net',
    apiUrl: 'https://exp-l1.jibchain.net/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xc0C8C486D1466C57Efe13C2bf000d4c56F47CBdC',
      blockCreated: 2299048,
    },
  },
  testnet: false,
})
