import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const monadTestnet = /*#__PURE__*/ Chain.from({
  id: 10_143,
  name: 'Monad Testnet',
  blockTime: 400,
  nativeCurrency: {
    name: 'Testnet MON Token',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://testnet-rpc.monad.xyz',
  },
  blockExplorers: {
    name: 'Monad Testnet explorer',
    url: 'https://testnet.monadexplorer.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 251449,
    },
  },
  testnet: true,
})
