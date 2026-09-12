import { defineChain } from '../../utils/chain/defineChain.js'

export const robinhoodTestnet = /*#__PURE__*/ defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.testnet.chain.robinhood.com',
      apiUrl: 'https://explorer.testnet.chain.robinhood.com/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x8705DEC51223E119C5C9f03121626d086A8eF753',
    },
    ensUniversalResolver: {
      address: '0x7112730612e4253Ba2e418A86580615A2c3CDB1D',
      blockCreated: 103084077,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  testnet: true,
})
