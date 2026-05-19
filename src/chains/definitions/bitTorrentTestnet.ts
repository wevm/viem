import * as Chain from '../../core/Chain.js'

export const bitTorrentTestnet = /*#__PURE__*/ Chain.define({
  id: 1028n,
  name: 'BitTorrent Chain Testnet',
  network: 'bittorrent-chain-testnet',
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
