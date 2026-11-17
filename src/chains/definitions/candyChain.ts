import * as Contracts from '../../core/internal/contracts.js'
import * as Chain from '../../core/Chain.js'

export const candyChain = /*#__PURE__*/ Chain.from({
  id: 2828,
  name: 'CandyChain',
  nativeCurrency: {
    decimals: 18,
    name: 'CANDY',
    symbol: 'CANDY',
  },
  rpcUrls: {
    http: ['https://publicrpc.candychain.io'],
  },
  blockExplorers: {
    name: 'CandyChain Explorer',
    url: 'https://streams.candychain.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2039339,
    },
  },
})
