import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const jovay = /*#__PURE__*/ Chain.from({
  id: 5_734_951,
  name: 'Jovay Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.jovay.io',
  },
  blockExplorers: {
    name: 'Jovay Explorer',
    url: 'https://explorer.jovay.io/l2',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
