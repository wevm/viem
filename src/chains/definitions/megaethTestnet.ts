import { defineChain } from '../../utils/chain/defineChain.js'

export const megaethTestnet = /*#__PURE__*/ defineChain({
  id: 6342,
  name: 'MegaETH Testnet',
  nativeCurrency: {
    name: 'MegaETH Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc'],
      webSocket: ['wss://carrot.megaeth.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MegaETH Testnet Explorer',
      url: 'https://www.megaexplorer.xyz/',
    },
  },
  testnet: true,
})
