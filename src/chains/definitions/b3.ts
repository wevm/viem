import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

const sourceId = 8453 // base

export const b3 = /*#__PURE__*/ Chain.from({
  id: 8333,
  name: 'B3',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://mainnet-rpc.b3.fun/http',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.b3.fun',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  sourceId,
})
