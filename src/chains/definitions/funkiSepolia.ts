import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia
 
export const funkiSepolia = defineChain({
  ...chainConfig,
  id: 3397901,
  network: 'funkiSepolia',
  name: "Funki Sepolia Sandbox",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://funki-testnet.alt.technology"],
    },
  },
  blockExplorers: {
    default: {
      name: "Funki Sepolia Sandbox Explorer",
      url: "https://sepolia-sandbox.funkichain.com/",
    },
  },
  testnet: true,
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: "0xB25812386D1Cb976b50de7387F5CBc10Fec3F27c",
      },
    },
    portal: {
      [sourceId]: {
        address: "0xCeE7ef4dDF482447FE14c605Ea94B37cBE87Ca9D",
        blockCreated: 5854312,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x1ba82f688eF3C5B4363Ff667254ed4DC59E97477",
        blockCreated: 5854312,
      },
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1620204,
    },
  },
  sourceId,
})