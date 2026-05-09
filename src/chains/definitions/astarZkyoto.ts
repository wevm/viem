import { defineChain } from '../../utils/chain/defineChain.js'

export const astarZkyoto = /*#__PURE__*/ defineChain({
  id: 6_038_361,
  name: 'Astar zkEVM Testnet zKyoto',
  network: 'zKyoto',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.startale.com/zkyoto'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zKyoto Explorer',
      url: 'https://zkyoto.explorer.startale.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 196153,
    },
  },
  testnet: true,
})
