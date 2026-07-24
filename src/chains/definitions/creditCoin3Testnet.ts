import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const creditCoin3Testnet = /*#__PURE__*/ Chain.from({
  id: 102031,
  name: 'Creditcoin Testnet',
  nativeCurrency: { name: 'Creditcoin Testnet', symbol: 'tCTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.cc3-testnet.creditcoin.network',
    ws: 'wss://rpc.cc3-testnet.creditcoin.network',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://creditcoin-testnet.blockscout.com',
    apiUrl: 'https://creditcoin-testnet.blockscout.com/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
