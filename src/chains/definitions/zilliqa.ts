import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zilliqa = /*#__PURE__*/ Chain.from({
  id: 32769,
  name: 'Zilliqa',
  nativeCurrency: { name: 'Zilliqa', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    http: 'https://api.zilliqa.com',
  },
  blockExplorers: {
    name: 'Ethernal',
    url: 'https://evmx.zilliqa.com',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
