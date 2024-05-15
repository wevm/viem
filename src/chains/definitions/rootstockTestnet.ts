import { defineChain } from '../../utils/chain/defineChain.js'

export const rootstockTestnet = /*#__PURE__*/ defineChain({
  id: 31,
  name: 'Rootstock Testnet',
  network: 'rootstock',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Bitcoin',
    symbol: 'tRBTC',
  },
  rpcUrls: {
    default: { http: ['https://public-node.testnet.rsk.co'] },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.testnet.rootstock.io/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xCa1167915584462449EE5B4EA51C37FE81ECdCCd',
      blockCreated: 5108224,
    },
  },
})
