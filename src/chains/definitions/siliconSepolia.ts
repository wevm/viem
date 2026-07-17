import * as Chain from '../../core/Chain.js'

export const siliconSepolia = /*#__PURE__*/ Chain.from({
  id: 1722641160,
  name: 'Silicon Sepolia zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: [
      'https://rpc-sepolia.silicon.network',
      'https://silicon-testnet.nodeinfra.com',
    ],
  },
  blockExplorers: {
    name: 'SiliconSepoliaScope',
    url: 'https://scope-sepolia.silicon.network',
  },
  testnet: true,
})
