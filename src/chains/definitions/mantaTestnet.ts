import { defineChain } from '../../utils/chain/defineChain.js'

export const mantaTestnet = /*#__PURE__*/ defineChain({
  id: 3_441_005,
  name: 'Manta Pacific Testnet',
  network: 'manta-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://manta-testnet.calderachain.xyz/http'] },
    public: { http: ['https://manta-testnet.calderachain.xyz/http'] },
  },
  blockExplorers: {
    etherscan: {
      name: 'Manta Testnet Explorer',
      url: 'https://pacific-explorer.testnet.manta.network',
    },
    default: {
      name: 'Manta Testnet Explorer',
      url: 'https://pacific-explorer.testnet.manta.network',
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
