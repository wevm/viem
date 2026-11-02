import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const kcc = /*#__PURE__*/ Chain.from({
  id: 321,
  name: 'KCC Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KCS',
    symbol: 'KCS',
  },
  rpcUrls: {
    http: 'https://kcc-rpc.com',
  },
  blockExplorers: { name: 'KCC Explorer', url: 'https://explorer.kcc.io' },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11760430,
    },
  },
  testnet: false,
})
