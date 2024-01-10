import { defineChain } from '../../utils/chain/defineChain.js'

export const bitTorrentTestnet = /*#__PURE__*/ defineChain({
  id: 1028,
  name: 'BitTorrent Chain Testnet',
  network: 'bittorrent-chain-testnet',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.bittorrentchain.io'] },
    public: { http: ['https://testrpc.bittorrentchain.io'] },
  },
  blockExplorers: {
    etherscan: { name: 'Bttcscan', url: 'https://testnet.bttcscan.com' },
    default: { name: 'Bttcscan', url: 'https://testnet.bttcscan.com' },
  },
  testnet: true,
})
