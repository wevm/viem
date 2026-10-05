import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const dogechain = /*#__PURE__*/ Chain.from({
  id: 2_000,
  name: 'Dogechain',
  nativeCurrency: {
    decimals: 18,
    name: 'Wrapped Dogecoin',
    symbol: 'WDOGE',
  },
  rpcUrls: { http: 'https://rpc.dogechain.dog' },
  blockExplorers: {
    name: 'DogeChainExplorer',
    url: 'https://explorer.dogechain.dog',
    apiUrl: 'https://explorer.dogechain.dog/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x68a8609a60a008EFA633dfdec592c03B030cC508',
      blockCreated: 25384031,
    },
  },
})
