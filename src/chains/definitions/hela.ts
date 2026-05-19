import * as Chain from '../../core/Chain.js'

export const hela = /*#__PURE__*/ Chain.define({
  id: 8668n,
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
