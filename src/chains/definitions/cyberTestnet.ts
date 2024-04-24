import { defineChain } from '../../utils/chain/defineChain.js'

export const cyberTestnet = /*#__PURE__*/ defineChain({
  id: 111_557_560,
  name: 'Cyber Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://cyber-testnet.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet.cyberscan.co',
      apiUrl: 'https://testnet.cyberscan.co/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xffc391F0018269d4758AEA1a144772E8FB99545E',
      blockCreated: 304545,
    },
  },
  testnet: true,
})
