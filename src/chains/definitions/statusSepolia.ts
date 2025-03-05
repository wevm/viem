import { defineChain } from '../../utils/chain/defineChain.js'

export const statusSepolia = /*#__PURE__*/ defineChain({
  id: 1_660_990_954,
  name: 'Status Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://public.sepolia.rpc.status.network'],
      webSocket: ['wss://status-sepolia-rpc.eu-north-2.gateway.fm/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Status Sepolia Block Explorer',
      url: 'https://sepoliascan.status.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1_578_364,
    },
  },
  testnet: true,
})
