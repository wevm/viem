import { defineChain } from '../../utils/chain/defineChain.js'

export const bitTorrentTestnet = /*#__PURE__*/ defineChain({
  id: 1028,
  name: 'BitTorrent Chain Donau',
  network: 'bittorrent-chain-donau',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://pre-rpc.bt.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Bttcscan',
      url: 'https://testnet.bttcscan.com',
      apiUrl: 'https://api-testnet.bttcscan.com/api',
    },
  },
  testnet: true,
})
