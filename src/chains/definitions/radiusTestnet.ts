import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const radiusTestnet = /*#__PURE__*/ Chain.from({
  id: 72_344,
  name: 'Radius Test Network',
  nativeCurrency: { name: 'Radius USD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.testnet.radiustech.xyz',
  },
  blockExplorers: {
    name: 'Radius Test Network Explorer',
    url: 'https://testnet.radiustech.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
