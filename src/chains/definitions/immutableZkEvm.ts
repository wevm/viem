import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const immutableZkEvm = /*#__PURE__*/ Chain.from({
  id: 13371,
  name: 'Immutable zkEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Immutable Coin',
    symbol: 'IMX',
  },
  rpcUrls: {
    http: 'https://rpc.immutable.com',
  },
  blockExplorers: {
    name: 'Immutable Explorer',
    url: 'https://explorer.immutable.com',
    apiUrl: 'https://explorer.immutable.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x236bdA4589e44e6850f5aC6a74BfCa398a86c6c0',
      blockCreated: 4335972,
    },
  },
})
