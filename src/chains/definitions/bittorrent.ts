import { defineChain } from '../../utils/chain/defineChain.js'

export const bitTorrent = /*#__PURE__*/ defineChain({
  id: 199,
  name: 'BitTorrent',
  network: 'bittorrent-chain-mainnet',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bittorrentchain.io'] },
    public: { http: ['https://rpc.bittorrentchain.io'] },
  },
  blockExplorers: {
    etherscan: { name: 'Bttcscan', url: 'https://bttcscan.com' },
    default: { name: 'Bttcscan', url: 'https://bttcscan.com' },
  },
})
