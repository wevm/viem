import * as Chain from '../../core/Chain.js'

export const gnosis = /*#__PURE__*/ Chain.from({
  id: 100,
  name: 'Gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'xDAI',
    symbol: 'XDAI',
  },
  blockTime: 5_000,
  rpcUrls: {
    http: 'https://rpc.gnosischain.com',
    ws: 'wss://rpc.gnosischain.com/wss',
  },
  blockExplorers: {
    name: 'Gnosisscan',
    url: 'https://gnosisscan.io',
    apiUrl: 'https://api.gnosisscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
})
