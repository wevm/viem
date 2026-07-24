import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const lightlinkPegasus = /*#__PURE__*/ Chain.from({
  id: 1_891,
  name: 'LightLink Pegasus Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://replicator.pegasus.lightlink.io/rpc/v1',
  },
  blockExplorers: {
    name: 'LightLink Pegasus Explorer',
    url: 'https://pegasus.lightlink.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 127_188_532,
    },
  },
  testnet: true,
})
