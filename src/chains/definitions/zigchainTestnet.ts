import { defineChain } from '../../utils/chain/defineChain.js'

export const zigchainTestnet = /*#__PURE__*/ defineChain({
  id: 2061,
  name: 'ZIGChain Testnet',
  nativeCurrency: { name: 'ZIG', symbol: 'ZIG', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://public-zigchain-testnet-evm-rpc.numia.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ZIGScan',
      url: 'https://testnet.zigscan.org',
    },
  },
  testnet: true,
})
