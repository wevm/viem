import { defineChain } from '../../utils/chain/defineChain.js'

export const xdcTestnet = /*#__PURE__*/ defineChain({
  id: 51,
  name: 'Apothem Network',
  network: 'xdc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'TXDC',
    symbol: 'TXDC',
  },
  rpcUrls: {
    default: { http: ['https://erpc.apothem.network'] },
    public: { http: ['https://erpc.apothem.network'] },
  },
  blockExplorers: {
    xinfin: { name: 'XinFin', url: 'https://explorer.apothem.network' },
    default: { name: 'Blocksscan', url: 'https://apothem.blocksscan.io' },
  },
})
