import * as Chain from '../../core/Chain.js'

export const beam = /*#__PURE__*/ Chain.from({
  id: 4337,
  name: 'Beam',
  nativeCurrency: {
    decimals: 18,
    name: 'Beam',
    symbol: 'BEAM',
  },
  rpcUrls: {
    http: 'https://build.onbeam.com/rpc',
    ws: 'wss://build.onbeam.com/ws',
  },
  blockExplorers: {
    name: 'Beam Explorer',
    url: 'https://subnets.avax.network/beam',
  },
  contracts: {
    multicall3: {
      address: '0x4956f15efdc3dc16645e90cc356eafa65ffc65ec',
      blockCreated: 1,
    },
  },
})
