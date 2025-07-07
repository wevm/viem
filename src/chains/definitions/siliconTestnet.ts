import { defineChain } from '../../utils/chain/defineChain.js'

export const siliconSepolia = /*#__PURE__*/ defineChain({
  id: 1414,
  name: 'Silicon Sepolia zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-sepolia.node.0xsilicon.net:8545',
        'https://rpc-sepolia.node.0xsilicon.net',
        'https://silicon-testnet.nodeinfra.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'SiliconSepoliaScope',
      url: 'https://scope-sepolia.silicon.network',
    },
  },
  testnet: true,
})
