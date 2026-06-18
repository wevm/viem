import * as Chain from '../../core/Chain.js'

export const bitTorrent = /*#__PURE__*/ Chain.from({
  id: 199,
  name: 'BitTorrent',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bittorrentchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Bttcscan',
      url: 'https://bttcscan.com',
      apiUrl: 'https://api.bttcscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 31078552,
    },
  },
})
