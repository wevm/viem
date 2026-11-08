import * as Chain from '../../core/Chain.js'

export const filecoin = /*#__PURE__*/ Chain.from({
  id: 314,
  name: 'Filecoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'filecoin',
    symbol: 'FIL',
  },
  rpcUrls: { http: 'https://api.node.glif.io/rpc/v1' },
  blockExplorers: {
    name: 'Filfox',
    url: 'https://filfox.info/en',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3328594,
    },
  },
})
