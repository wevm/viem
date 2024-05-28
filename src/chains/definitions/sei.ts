import { defineChain } from "../../utils/chain/defineChain.js";

export const sei = /*#__PURE__*/ defineChain({
  id: 1329,
  name: "Sei",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc.sei-apis.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Seitrace",
      url: "https://seitrace.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcb2436774C3e191c85056d248EF4260ce5f27A9D",
    },
  },
});
