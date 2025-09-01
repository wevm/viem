import { defineChain } from '../../utils/chain/defineChain.js';

export const somniaTestnet = /*#__PURE__*/ defineChain({
  id: 5031,
  name: 'Somnia',
  nativeCurrency: { name: 'SOMI', symbol: 'SOMI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.infra.mainnet.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
      apiUrl: 'https://explorer.somnia.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11',
      blockCreated: 38516341,
    },
  },
});
