import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const creditCoin3Mainnet = /*#__PURE__*/ Chain.from({
  id: 102030,
  name: 'Creditcoin',
  nativeCurrency: { name: 'Creditcoin', symbol: 'CTC', decimals: 18 },
  rpcUrls: {
    http: 'https://mainnet3.creditcoin.network',
    ws: 'wss://mainnet3.creditcoin.network',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://creditcoin.blockscout.com',
    apiUrl: 'https://creditcoin.blockscout.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x47b51dC7b7Bbb3d9eB12080e3DA6E26125e8D75e',
      blockCreated: 4_373_631,
    },
  },
  testnet: false,
})
