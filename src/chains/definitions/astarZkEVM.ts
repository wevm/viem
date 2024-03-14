import { defineChain } from '../../utils/chain/defineChain.js'

export const astarZkEVM = /*#__PURE__*/ defineChain({
  id: 3_776,
  name: 'Astar zkEVM',
  network: 'AstarZkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.startale.com/astar-zkevm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Astar zkEVM Explorer',
      url: 'https://astar-zkevm.explorer.startale.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x36eabf148272BA81A5225C6a3637972F0EE17771',
      blockCreated: 93528,
    },
  },
  testnet: false,
})
