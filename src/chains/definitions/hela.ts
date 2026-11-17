import * as Chain from '../../core/Chain.js'

export const hela = /*#__PURE__*/ Chain.from({
  id: 8668,
  name: 'Hela Mainnet',
  nativeCurrency: {
    name: 'HLUSD',
    symbol: 'HLUSD',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://mainnet-rpc.helachain.com',
  },
  blockExplorers: {
    name: 'Hela explorer',
    url: 'https://mainnet-blockexplorer.helachain.com',
  },
  testnet: false,
})
