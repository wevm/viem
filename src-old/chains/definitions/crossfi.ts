import { defineChain } from '../../utils/chain/defineChain.js'

export const crossfi = /*#__PURE__*/ defineChain({
  id: 4_158,
  name: 'CrossFi Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CrossFi',
    symbol: 'XFI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.ms'] },
  },
  blockExplorers: {
    default: {
      name: 'CrossFi Blockchain Explorer',
      url: 'https://xfiscan.com',
    },
  },
  testnet: false,
})
