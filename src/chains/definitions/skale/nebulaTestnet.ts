import * as Chain from '../../../core/Chain.js'

export const skaleNebulaTestnet = /*#__PURE__*/ Chain.from({
  id: 37_084_624,
  name: 'SKALE Nebula Testnet',
  nativeCurrency: { name: 'sFUEL', symbol: 'sFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.skalenodes.com/v1/lanky-ill-funny-testnet',
    ws: 'wss://testnet.skalenodes.com/v1/ws/lanky-ill-funny-testnet',
  },
  blockExplorers: {
    name: 'SKALE Explorer',
    url: 'https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 105_141,
    },
  },
  testnet: true,
})
