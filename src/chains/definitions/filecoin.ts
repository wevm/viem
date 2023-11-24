import { defineChain } from '../../utils/chain/defineChain.js'

export const filecoin = /*#__PURE__*/ defineChain({
  id: 314,
  name: 'Filecoin Mainnet',
  network: 'filecoin-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'filecoin',
    symbol: 'FIL',
  },
  rpcUrls: {
    default: { http: ['https://api.node.glif.io/rpc/v1'] },
    public: { http: ['https://api.node.glif.io/rpc/v1'] },
  },
  blockExplorers: {
    default: { name: 'Filfox', url: 'https://filfox.info/en' },
    filscan: { name: 'Filscan', url: 'https://filscan.io' },
    filscout: { name: 'Filscout', url: 'https://filscout.io/en' },
    glif: { name: 'Glif', url: 'https://explorer.glif.io' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3328594,
    },
  },
})
