import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const saigon = /*#__PURE__*/ Chain.from({
  id: 202601,
  name: 'Ronin Saigon Testnet',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: {
    http: 'https://saigon-testnet.roninchain.com/rpc',
  },
  blockExplorers: {
    name: 'Saigon Explorer',
    url: 'https://saigon-explorer.roninchain.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 18736871,
    },
  },
  testnet: true,
})
