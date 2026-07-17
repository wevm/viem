import * as Chain from '../../core/Chain.js'

export const horizenTestnet = /*#__PURE__*/ Chain.from({
  id: 2651420,
  name: 'Horizen Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://horizen-testnet.rpc.caldera.xyz/http',
  },
  blockExplorers: {
    name: 'Horizen Testnet Caldera Explorer',
    url: 'https://horizen-testnet.explorer.caldera.xyz',
  },
  testnet: true,
})
