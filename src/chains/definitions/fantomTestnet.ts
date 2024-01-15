import { defineChain } from '../../utils/chain/defineChain.js'

export const fantomTestnet = /*#__PURE__*/ defineChain({
  id: 4_002,
  name: 'Fantom Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.fantom.network'] },
  },
  blockExplorers: {
    default: {
      name: 'FTMScan',
      url: 'https://testnet.ftmscan.com',
      apiUrl: 'https://testnet.ftmscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 8328688,
    },
  },
})
