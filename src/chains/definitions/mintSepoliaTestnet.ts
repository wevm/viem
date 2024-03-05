import { defineChain } from '../../utils/chain/defineChain.js'

export const mintSepoliaTestnet = /*#__PURE__*/ defineChain({
  id: 1686,
  name: 'Mint Sepolia Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.mintchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mintchain Testnet explorer',
      url: 'https://testnet-explorer.mintchain.io',
    },
  },
  testnet: true,
})
