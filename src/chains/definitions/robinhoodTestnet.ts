import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const robinhoodTestnet = /*#__PURE__*/ Chain.from({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.chain.robinhood.com',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://explorer.testnet.chain.robinhood.com',
    apiUrl: 'https://explorer.testnet.chain.robinhood.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: true,
})
