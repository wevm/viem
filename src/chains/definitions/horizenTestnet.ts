import { defineChain } from '../../utils/chain/defineChain.js'

export const horizenTestnet = /*#__PURE__*/ defineChain({
  id: 2651420,
  name: 'Horizen Testnet',
  network: 'horizen-testnet',
  nativeCurrency: {
    symbol: 'Sepolia Ether',
    name: 'ETH',
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
