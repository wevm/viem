import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachainAthensTestnet = /*#__PURE__*/ defineChain({
  id: 7001,
  name: "Zetachain Athens 3 Testnet",
  testnet:true,
  nativeCurrency: {
    name: "ZetaChain Testnet",
    symbol: "ZETA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
    },
  },
  blockExplorers: {
    default: {
      name: "ZetaScan",
      url: "https://athens.explorer.zetachain.com/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601,
    },
  },
})
