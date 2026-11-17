import * as Chain from '../../core/Chain.js'

export const metachain = /*#__PURE__*/ Chain.from({
  id: 571,
  name: 'MetaChain Mainnet',
  nativeCurrency: { name: 'Metatime Coin', symbol: 'MTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.metatime.com',
  },
  blockExplorers: {
    name: 'MetaExplorer',
    url: 'https://explorer.metatime.com',
  },
  contracts: {
    multicall3: {
      address: '0x0000000000000000000000000000000000003001',
      blockCreated: 0,
    },
  },
})
