import * as Chain from '../../core/Chain.js'

export const mantaTestnet = /*#__PURE__*/ Chain.define({
  id: 3_441_005n,
  name: 'Manta Pacific Testnet',
  network: 'manta-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://manta-testnet.calderachain.xyz/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Manta Testnet Explorer',
      url: 'https://pacific-explorer.testnet.manta.network',
      apiUrl: 'https://pacific-explorer.testnet.manta.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x211B1643b95Fe76f11eD8880EE810ABD9A4cf56C',
      blockCreated: 419915,
    },
  },
  testnet: true,
})
