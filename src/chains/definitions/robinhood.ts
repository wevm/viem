import { defineChain } from '../../utils/chain/defineChain.js'

export const robinhood = /*#__PURE__*/ defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
      apiUrl: 'https://robinhoodchain.blockscout.com/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x29d8cEae06c4F97c784BD016A41eB45c9A2d6aE1',
    },
    ensUniversalResolver: {
      address: '0x1C336914666256e2c5131FB460C598F2EAB0292B',
      blockCreated: 41235731,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
