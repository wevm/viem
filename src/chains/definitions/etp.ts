import { defineChain } from '../../utils/chain/defineChain.js'

export const etp = /*#__PURE__*/ defineChain({
  id: 20_256_789,
  name: 'ETP Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETP Chain Native Token',
    symbol: 'ETP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.etpscan.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'ETP Scan',
      url: 'https://etpscan.xyz',
    },
  },
})
