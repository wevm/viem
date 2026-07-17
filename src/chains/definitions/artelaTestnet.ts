import * as Chain from '../../core/Chain.js'

export const artelaTestnet = /*#__PURE__*/ Chain.from({
  id: 11822,
  name: 'Artela Testnet',
  nativeCurrency: { name: 'ART', symbol: 'ART', decimals: 18 },
  rpcUrls: {
    http: 'https://betanet-rpc1.artela.network',
  },
  blockExplorers: {
    name: 'Artela',
    url: 'https://betanet-scan.artela.network',
    apiUrl: 'https://betanet-scan.artela.network/api',
  },
  contracts: {
    multicall3: {
      address: '0xd07c8635f76e8745Ee7092fbb6e8fbc5FeF09DD7',
      blockCreated: 7001871,
    },
  },
  testnet: true,
})
