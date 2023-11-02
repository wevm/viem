import { defineChain } from '../../utils/chain/defineChain.js'

export const fuse = /*#__PURE__*/ defineChain({
  id: 122,
  name: 'Fuse',
  network: 'fuse',
  nativeCurrency: { name: 'Fuse', symbol: 'FUSE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.fuse.io'] },
    public: { http: ['https://rpc.fuse.io'] },
  },
  blockExplorers: {
    default: { name: 'Fuse Explorer', url: 'https://explorer.fuse.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 16146628,
    },
  },
})
