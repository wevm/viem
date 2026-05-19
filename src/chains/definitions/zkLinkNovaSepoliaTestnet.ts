import * as Chain from '../../core/Chain.js'

export const zkLinkNovaSepoliaTestnet = /*#__PURE__*/ Chain.define({
  id: 810181n,
  name: 'zkLink Nova Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.rpc.zklink.io'] },
  },
  blockExplorers: {
    default: {
      name: 'zkLink Nova Block Explorer',
      url: 'https://sepolia.explorer.zklink.io',
    },
  },
  testnet: true,
})
