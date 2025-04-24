import { defineChain } from '../../utils/chain/defineChain.js'

export const nibiru = /*#__PURE__*/ defineChain({
  id: 6900,
  name: 'Nibiru',
  nativeCurrency: {
    decimals: 18,
    name: 'NIBI',
    symbol: 'NIBI',
  },
  rpcUrls: {
    default: { http: ['https://evm-rpc.nibiru.fi'] },
  },
  blockExplorers: {
    default: {
      name: 'NibiScan',
      url: 'https://nibiscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 19587573,
    },
  },
})
