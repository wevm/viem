import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachainAthensTestnet = /*#__PURE__*/ defineChain({
  id: 7001,
  name: "Zetachain Athens 3 Testnet",
  testnet:true,
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/21259.png",
  nativeCurrency: {
    name: "ZetaChain Athens 3 Testnet",
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
      name: "zetachain",
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
