import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const bobSepolia = defineChain({
  id: 111,
  name: 'BOB Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.gobob.xyz']
    },
  },
  blockExplorers: {
    default: {
      name: 'BOB Sepolia Explorer',
      url: 'https://testnet-explorer.gobob.xyz'
    },
  },
  contracts: {
    multicall3: {
      address: '0x089b191d95417817389c8eD9075b51a38ca46DE8',
      blockCreated: 2469044
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x14D0069452b4AE2b250B395b8adAb771E4267d2f',
        blockCreated: 4462615
      }
    },
    portal: {
      [sourceId]: {
        address: '0x867B1Aa872b9C8cB5E9F7755feDC45BB24Ad0ae4',
        blockCreated: 4462615
      }
    }
  },
  testnet: true,
  sourceId
})
