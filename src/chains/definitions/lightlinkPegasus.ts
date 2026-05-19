import * as Chain from '../../core/Chain.js'

export const lightlinkPegasus = /*#__PURE__*/ Chain.define({
  id: 1_891n,
  name: 'LightLink Pegasus Testnet',
  network: 'lightlink-pegasus',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://replicator.pegasus.lightlink.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LightLink Pegasus Explorer',
      url: 'https://pegasus.lightlink.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 127_188_532,
    },
  },
  testnet: true,
})
