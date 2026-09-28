import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const coreTestnet2 = /*#__PURE__*/ Chain.from({
  id: 1114,
  name: 'Core Testnet2',
  nativeCurrency: {
    decimals: 18,
    name: 'tCore2',
    symbol: 'TCORE2',
  },
  rpcUrls: { http: 'https://rpc.test2.btcs.network' },
  blockExplorers: {
    name: 'Core Testnet2',
    url: 'https://scan.test2.btcs.network',
    apiUrl: 'https://api.test2.btcs.network/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x3CB285ff3Cd5C7C7e570b1E7DE3De17A0f985e56',
      blockCreated: 3_838_600,
    },
  },
  testnet: true,
})
