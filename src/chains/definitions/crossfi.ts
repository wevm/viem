import * as Chain from '../../core/Chain.js'

export const crossfi = /*#__PURE__*/ Chain.define({
  id: 4_158n,
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
