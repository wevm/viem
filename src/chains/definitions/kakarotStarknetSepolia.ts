import * as Chain from '../../core/Chain.js'

export const kakarotStarknetSepolia = /*#__PURE__*/ Chain.define({
  id: 920637907288165n,
  name: 'Kakarot Starknet Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.kakarot.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kakarot Scan',
      url: 'https://sepolia.kakarotscan.org',
    },
  },
  testnet: true,
})
