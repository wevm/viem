import { defineChain } from '../../utils/chain/defineChain.js'

export const bitTorrentTestnet = /*#__PURE__*/ defineChain({
  id: 1029,
  name: 'BitTorrent Chain Testnet',
  network: 'bittorrent-chain-testnet',
  nativeCurrency: { name: 'BitTorrent', symbol: 'BTT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://pre-rpc.bt.io'] },
    public: { http: ['https://pre-rpc.bt.io'] },
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
