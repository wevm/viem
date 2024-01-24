import { defineChain } from '../../utils/chain/defineChain.js'

export const beamTestnet = /*#__PURE__*/ defineChain({
  id: 13_337,
  name: 'Beam Testnet',
  nativeCurrency: { name: 'Beam', symbol: 'BEAM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://build.onbeam.com/rpc/testnet'],
      webSocket: ['wss://build.onbeam.com/ws/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Avalanche Explorer',
      url: 'https://subnets-test.avax.network/beam',
    },
  },
  contracts: {
    multicall3: {
      address: '0x9BF49b704EE2A095b95c1f2D4EB9010510c41C9E',
      blockCreated: 3,
    },
  },
  testnet: true,
})
