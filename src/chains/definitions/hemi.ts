import { defineChain } from '../../utils/chain/defineChain.js'

export const hemi = /*#__PURE__*/ defineChain({
  id: 43111,
  name: 'Hemi',
  network: 'Hemi',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hemi.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.hemi.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: "0x3FBA66680F0F468089233bB14E40725eCB66AF7A",
    },
    ensRegistry: {
      address: "0x099fee7f2ef53eb7ccc0e465a32f3aefa8d703c5"
    },
    ensUniversalResolver: {
      address: "0x4bb8573ddb5b8369c87bd6d7e34137d7ce674f2b",
      blockCreated: 1360113,
    },
  },
  testnet: false,
})
