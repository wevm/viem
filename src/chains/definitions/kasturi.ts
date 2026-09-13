import { defineChain } from '../../utils/chain/defineChain.js';

export const kasturi = /*#__PURE__*/ defineChain({
  id: 108108,
  name: 'KasturiChain',
  nativeCurrency: {
    name: 'Nilashyam',
    symbol: 'NILA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.yugala.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Satya Explorer',
      url: 'https://satya.kasturisundari.xyz',
    },
  },
});
