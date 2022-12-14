// TODO: Remove PoC implementation once @wagmi/chains provides custom chain types.

import type { Chain as Chain_ } from '@wagmi/chains'
import {
  arbitrumGoerli as arbitrumGoerli_,
  arbitrum as arbitrum_,
  avalancheFuji as avalancheFuji_,
  avalanche as avalanche_,
  bscTestnet as bscTestnet_,
  bsc as bsc_,
  fantomTestnet as fantomTestnet_,
  fantom as fantom_,
  foundry as foundry_,
  goerli as goerli_,
  hardhat as hardhat_,
  localhost as localhost_,
  mainnet as mainnet_,
  optimismGoerli as optimismGoerli_,
  optimism as optimism_,
  polygonMumbai as polygonMumbai_,
  polygon as polygon_,
  sepolia as sepolia_,
} from '@wagmi/chains'

import type {
  Address,
  Block,
  Data,
  Quantity,
  RpcBlock,
  RpcTransaction,
  RpcTransactionRequest,
  Transaction,
  TransactionRequest,
} from './types'

export type Formatter<TSource = any, TTarget = any> = Partial<{
  [K in keyof TSource | (string & Record<string, unknown>)]: (
    value: TSource,
  ) => K extends keyof TTarget ? TTarget[K] | undefined : unknown
}>

export type Formatters = {
  block?: Formatter<RpcBlock, Block>
  transaction?: Formatter<RpcTransaction, Transaction>
  transactionRequest?: Formatter<TransactionRequest, RpcTransactionRequest>
}

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}

export function defineChain<TFormatters extends Formatters = Formatters>(
  chain: Chain<TFormatters>,
) {
  return chain
}

export const arbitrumGoerli = defineChain(arbitrumGoerli_)
export const arbitrum = defineChain(arbitrum_)
export const avalancheFuji = defineChain(avalancheFuji_)
export const avalanche = defineChain(avalanche_)
export const bscTestnet = defineChain(bscTestnet_)
export const bsc = defineChain(bsc_)
export const celo = defineChain({
  id: 42220,
  name: 'Celo',
  network: 'celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/celo'] },
  },
  formatters: {
    block: {
      randomness: ({
        randomness,
      }: {
        randomness: { committed: Data; revealed: Data }
      }) => randomness,
      difficulty: () => undefined,
      gasLimit: () => undefined,
      mixHash: () => undefined,
      nonce: () => undefined,
      uncles: () => undefined,
    },
    transaction: {
      feeCurrency: ({ feeCurrency }: { feeCurrency: Address | null }) =>
        feeCurrency,
      gatewayFee: ({ gatewayFee }: { gatewayFee: Quantity | null }) =>
        gatewayFee ? BigInt(gatewayFee) : null,
      gatewayFeeRecipient: ({
        gatewayFeeRecipient,
      }: {
        gatewayFeeRecipient: Address | null
      }) => gatewayFeeRecipient,
    },
    transactionRequest: {
      feeCurrency: ({ feeCurrency }: { feeCurrency?: Address }) => feeCurrency,
      gatewayFee: ({ gatewayFee }: { gatewayFee?: bigint }) =>
        gatewayFee ? BigInt(gatewayFee) : undefined,
      gatewayFeeRecipient: ({
        gatewayFeeRecipient,
      }: {
        gatewayFeeRecipient?: Address
      }) => gatewayFeeRecipient,
    },
  },
})
export const fantomTestnet = defineChain(fantomTestnet_)
export const fantom = defineChain(fantom_)
export const foundry = defineChain(foundry_)
export const goerli = defineChain(goerli_)
export const hardhat = defineChain(hardhat_)
export const localhost = defineChain(localhost_)
export const mainnet = defineChain(mainnet_)
export const optimismGoerli = defineChain(optimismGoerli_)
export const optimism = defineChain(optimism_)
export const polygonMumbai = defineChain(polygonMumbai_)
export const polygon = defineChain(polygon_)
export const sepolia = defineChain(sepolia_)
