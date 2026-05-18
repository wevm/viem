import { defineChain } from '../../utils/chain/defineChain.js'

export const silicon = /*#__PURE__*/ defineChain({
  id: 2355,
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
