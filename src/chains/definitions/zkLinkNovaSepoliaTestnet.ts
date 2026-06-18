import * as Chain from '../../core/Chain.js'

export const zkLinkNovaSepoliaTestnet = /*#__PURE__*/ Chain.from({
  id: 810181,
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
