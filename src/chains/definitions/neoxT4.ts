import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const neoxT4 = /*#__PURE__*/ Chain.from({
  id: 12227332,
  name: 'Neo X Testnet T4',
  nativeCurrency: { name: 'Gas', symbol: 'GAS', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.rpc.banelabs.org/',
  },
  blockExplorers: {
    name: 'neox-scan',
    url: 'https://xt4scan.ngd.network',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
