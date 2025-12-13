import { defineChain } from '../../utils/chain/defineChain.js'

export const taiko = /*#__PURE__*/ defineChain({
  id: 167000,
  name: 'Taiko Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.taiko.xyz'],
      webSocket: ['wss://ws.mainnet.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://taikoscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 11269,
    },
  },
})
