import { defineChain } from '../../utils/chain/defineChain.js'

export const mainnet = /*#__PURE__*/ defineChain({
  id: 138,
  name: 'Defi Oracle Meta Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.defi-oracle.io", "wss://wss.defi-oracle.io"],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout Explorer',
      url: 'https://blockscout.defi-oracle.io',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x34eCe27C724291C7233dC8114f76C1169f0863C8',             
    },
    ensUniversalResolver: {
      address: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
      blockCreated: 19_971_461,
    },
  },
})
