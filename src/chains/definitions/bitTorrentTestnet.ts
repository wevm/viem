import { defineChain } from '../../utils/chain/defineChain.js'

export const bitTorrentTestnet = /*#__PURE__*/ defineChain({
  id: 1028,
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
