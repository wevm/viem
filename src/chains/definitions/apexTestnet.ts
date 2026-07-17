import * as Chain from '../../core/Chain.js'

export const apexTestnet = /*#__PURE__*/ Chain.from({
  id: 3993,
  name: 'APEX Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-testnet.apexlayer.xyz',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://exp-testnet.apexlayer.xyz',
    apiUrl: 'https://exp-testnet.apexlayer.xyz/api',
  },
  contracts: {
    multicall3: {
      address: '0xf7642be33a6b18D16a995657adb5a68CD0438aE2',
      blockCreated: 283775,
    },
  },
  testnet: true,
})
