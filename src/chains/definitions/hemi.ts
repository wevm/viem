import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hemi = /*#__PURE__*/ Chain.from({
  id: 43111,
  name: 'Hemi',
  blockTime: 12_000,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.hemi.network/rpc',
  },
  blockExplorers: {
    name: 'blockscout',
    url: 'https://explorer.hemi.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
