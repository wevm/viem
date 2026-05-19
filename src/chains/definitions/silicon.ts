import * as Chain from '../../core/Chain.js'

export const silicon = /*#__PURE__*/ Chain.define({
  id: 2355n,
  name: 'Silicon zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.silicon.network',
        'https://silicon-mainnet.nodeinfra.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SiliconScope',
      url: 'https://scope.silicon.network',
    },
  },
})
