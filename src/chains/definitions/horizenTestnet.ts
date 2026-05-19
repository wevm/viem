import * as Chain from '../../core/Chain.js'

export const horizenTestnet = /*#__PURE__*/ Chain.define({
  id: 2651420n,
  name: 'Horizen Testnet',
  network: 'horizen-testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://horizen-testnet.rpc.caldera.xyz/http'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Horizen Testnet Caldera Explorer',
      url: 'https://horizen-testnet.explorer.caldera.xyz',
    },
  },
  testnet: true,
})
