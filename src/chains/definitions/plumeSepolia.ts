import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const plumeSepolia = /*#__PURE__*/ defineChain({
  id: 98_867,
  name: 'Plume Testnet',
  nativeCurrency: {
    name: 'Plume',
    symbol: 'PLUME',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.plumenetwork.xyz'],
      webSocket: ['wss://testnet-rpc.plumenetwork.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.plumenetwork.xyz',
      apiUrl: 'https://testnet-explorer.plumenetwork.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x59218e2df2A2E7Ba0de00c023e80906Ba47cB4C8',
      blockCreated: 1_681,
    },
  },
  testnet: true,
  sourceId,
})
