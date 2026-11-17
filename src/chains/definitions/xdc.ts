import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const xdc = /*#__PURE__*/ Chain.from({
  id: 50,
  name: 'XDC Network',
  nativeCurrency: {
    decimals: 18,
    name: 'XDC',
    symbol: 'XDC',
  },
  rpcUrls: { http: 'https://rpc.xdcrpc.com' },
  blockExplorers: {
    name: 'XDCScan',
    url: 'https://xdcscan.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x0B1795ccA8E4eC4df02346a082df54D437F8D9aF',
      blockCreated: 75884020,
    },
  },
})
