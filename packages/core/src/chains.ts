// TODO: Remove chain formatter implementation once @wagmi/chains supports it.

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
  RpcTransactionReceipt,
  RpcTransactionRequest,
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from './types'
import {
  formatBlock,
  formatTransaction,
  formatTransactionRequest,
} from './utils'
import { formatTransactionReceipt } from './utils/formatters/transactionReceipt'

export type Formatter<TSource = any, TTarget = any> = (
  value: TSource & { [key: string]: unknown },
) => TTarget

export type Formatters = {
  block?: Formatter<RpcBlock, Block>
  transaction?: Formatter<RpcTransaction, Transaction>
  transactionReceipt?: Formatter<RpcTransactionReceipt, TransactionReceipt>
  transactionRequest?: Formatter<TransactionRequest, RpcTransactionRequest>
}

export type Chain<TFormatters extends Formatters = Formatters> = Chain_ & {
  formatters?: TFormatters
}

export function defineChain<
  TFormatters extends Formatters = Formatters,
  TChain extends Chain<TFormatters> = Chain<TFormatters>,
>(chain: TChain) {
  return chain
}

function defineFormatter<TSource extends Record<string, unknown>, TFormatted>({
  format,
}: {
  format: (data: TSource) => TFormatted
}) {
  return <
      TFormat extends Formatter<
        TSource,
        Partial<TFormatted> & { [key: string]: unknown }
      >,
      TExclude extends (keyof TSource)[] = [],
    >({
      exclude,
      format: formatOverride,
    }: {
      exclude?: TExclude
      format?: TFormat
    }) =>
    (data: TSource & { [key: string]: unknown }) => {
      const formatted = format(data)
      if (exclude) {
        for (const key of exclude) {
          delete (formatted as any)[key]
        }
      }
      return {
        ...formatted,
        ...formatOverride?.(data),
      } as TFormatted &
        ReturnType<TFormat> & {
          [K in TExclude[number]]: never
        }
    }
}

export const defineBlock = defineFormatter({ format: formatBlock })
export const defineTransaction = defineFormatter({ format: formatTransaction })
export const defineTransactionRequest = defineFormatter({
  format: formatTransactionRequest,
})
export const defineTransactionReceipt = defineFormatter({
  format: formatTransactionReceipt,
})

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
    block: defineBlock({
      exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
      format: (block) => ({
        randomness: block.randomness as { committed: Data; revealed: Data },
      }),
    }),
    transaction: defineTransaction({
      format: (transaction) => ({
        feeCurrency: transaction.feeCurrency as Address | null,
        gatewayFee: transaction.gatewayFee
          ? BigInt(transaction.gatewayFee as Quantity)
          : null,
        gatewayFeeRecipient: transaction.gatewayFeeRecipient as Address | null,
      }),
    }),
    transactionRequest: defineTransactionRequest({
      format: (transactionRequest) => ({
        feeCurrency: transactionRequest.feeCurrency as Address | undefined,
        gatewayFee: transactionRequest.gatewayFee as Quantity | undefined,
        gatewayFeeRecipient: transactionRequest.gatewayFeeRecipient as
          | Address
          | undefined,
      }),
    }),
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
