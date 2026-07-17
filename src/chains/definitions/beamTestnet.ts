import * as Chain from '../../core/Chain.js'

export const beamTestnet = /*#__PURE__*/ Chain.from({
  id: 13337,
  name: 'Beam Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Beam',
    symbol: 'BEAM',
  },
  rpcUrls: {
    http: 'https://build.onbeam.com/rpc/testnet',
    ws: 'wss://build.onbeam.com/ws/testnet',
  },
  blockExplorers: {
    name: 'Beam Explorer',
    url: 'https://subnets-test.avax.network/beam',
  },
  contracts: {
    multicall3: {
      address: '0x9bf49b704ee2a095b95c1f2d4eb9010510c41c9e',
      blockCreated: 3,
    },
  },
  testnet: true,
})
