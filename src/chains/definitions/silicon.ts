import { defineChain } from '../../utils/chain/defineChain.js'

export const silicon = /*#__PURE__*/ defineChain({
  id: 2355,
  name: 'Silicon zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.silicon.network', 'https://silicon-mainnet.nodeinfra.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SiliconScope',
      url: 'https://scope.silicon.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0x291201dcF97e902c13B6AD26b334F3a64Fc5E5a9',
      blockCreated: 596061,
    },
  },
})
