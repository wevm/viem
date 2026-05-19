import * as Chain from '../../core/Chain.js'

export const unreal = /*#__PURE__*/ Chain.define({
  id: 18233n,
  name: 'Unreal',
  nativeCurrency: {
    name: 'reETH',
    decimals: 18,
    symbol: 'reETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.unreal-orbit.gelato.digital'] },
  },
  blockExplorers: {
    default: {
      name: 'Unreal Explorer',
      url: 'https://unreal.blockscout.com',
      apiUrl: 'https://unreal.blockscout.com/api/v2',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x8b6B0e60D8CD84898Ea8b981065A12F876eA5677',
      blockCreated: 1745,
    },
  },
})
