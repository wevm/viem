import { defineChain } from '../../utils/chain/defineChain.js'

export const lightlinkPegasus = /*#__PURE__*/ defineChain({
  id: 1_891,
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
  testnet: true,
})
