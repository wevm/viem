import { defineChain } from '../../utils/chain/defineChain.js'

export const zetachain = /*#__PURE__*/defineChain({
  id: 7000,
  name: "ZetaChain Mainnet",
  iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/21259.png",
  nativeCurrency: { name: "ZetaChain", symbol: "ZETA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://zetachain-evm.blockpi.network/v1/rpc/public"] },
  },
  blockExplorers: {
    default: { name: "ZetaScan", url: "https://explorer.zetachain.com/" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601,
    },
  },
})
