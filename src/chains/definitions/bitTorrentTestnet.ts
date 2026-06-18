import * as Chain from '../../core/Chain.js'

export const bitTorrentTestnet = /*#__PURE__*/ Chain.from({
  id: 1028,
  name: 'BitTorrent Chain Testnet',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.bittorrentchain.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Bttcscan',
      url: 'https://testnet.bttcscan.com',
      apiUrl: 'https://testnet.bttcscan.com/api',
    },
  },
  testnet: true,
})
