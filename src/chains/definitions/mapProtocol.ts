import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const mapProtocol = /*#__PURE__*/ Chain.from({
  id: 22776,
  name: 'MAP Protocol',
  nativeCurrency: {
    decimals: 18,
    name: 'MAPO',
    symbol: 'MAPO',
  },
  rpcUrls: { http: 'https://rpc.maplabs.io' },
  blockExplorers: {
    name: 'MAPO Scan',
    url: 'https://maposcan.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
