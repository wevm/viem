import { defineChain } from '../../utils/chain/defineChain.js'

export const goerli = /*#__PURE__*/ defineChain({
  id: 5,
  name: 'Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/eth_goerli'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
      apiUrl: 'https://api-goerli.etherscan.io/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xfc4AC75C46C914aF5892d6d3eFFcebD7917293F1',
      blockCreated: 10_339_206,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 6507670,
    },
  },
  testnet: true,
})
