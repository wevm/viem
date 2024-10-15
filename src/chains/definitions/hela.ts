import { defineChain } from '../../utils/chain/defineChain.js'

export const hela = /*#__PURE__*/ defineChain({
  id: 8668,
  name: 'Hela Mainnet',
  nativeCurrency: {
    name: 'HLUSD',
    symbol: 'HLUSD',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.helachain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hela explorer',
      url: 'https://mainnet-blockexplorer.helachain.com',
    },
  },
  testnet: false,
})
