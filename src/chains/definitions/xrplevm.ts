import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const xrplevm = /*#__PURE__*/ Chain.from({
  id: 1440000,
  name: 'XRPL EVM',
  nativeCurrency: {
    name: 'XRP',
    symbol: 'XRP',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.xrplevm.org' },
  blockExplorers: {
    name: 'blockscout',
    url: 'https://explorer.xrplevm.org',
    apiUrl: 'https://explorer.xrplevm.org/api/v2',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
