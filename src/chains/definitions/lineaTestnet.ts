import { defineChain } from '../../utils/chain/defineChain.js'
import { lineaEstimateFeesPerGas } from '../linea/actions/lineaEstimateFeesPerGas.js'

export const lineaTestnet = /*#__PURE__*/ defineChain({
  id: 59_140,
  name: 'Linea Goerli Testnet',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://linea-mainnet.infura.io/v3/ec39fccc12d54776b7234a4d3edde98b',
      ],
      webSocket: ['wss://rpc.goerli.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://goerli.lineascan.build',
      apiUrl: 'https://goerli.lineascan.build/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 498623,
    },
  },
  testnet: true,
  fees: {
    // Override the fees calculation to accurately price the fees
    // on Linea using the rpc call linea_estimateGas
    estimateFeesPerGas: lineaEstimateFeesPerGas,
    async defaultPriorityFee(args): Promise<bigint> {
      const { maxPriorityFeePerGas } = await lineaEstimateFeesPerGas({
        client: args.client,
        request: args.request,
        type: "eip1559",
      } as any);
    
      if (maxPriorityFeePerGas === undefined) {
        throw new Error("maxPriorityFeePerGas is undefined");
      }
    
      return maxPriorityFeePerGas;
    }
  },
})
