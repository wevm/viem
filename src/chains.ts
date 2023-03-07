import * as chains from '@wagmi/chains'

import type { Address, Hex, Quantity } from './types'
import {
  defineBlock,
  defineChain,
  defineTransaction,
  defineTransactionReceipt,
  defineTransactionRequest,
} from './utils'

export type { Chain } from './types'
export { defineChain } from './utils'

const celoFormatters = {
  block: defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format: (block) => ({
      randomness: block.randomness as {
        committed: Hex
        revealed: Hex
      },
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
  transactionReceipt: defineTransactionReceipt({
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
}

export const arbitrum = defineChain(chains.arbitrum)
export const arbitrumGoerli = defineChain(chains.arbitrumGoerli)
export const aurora = defineChain(chains.aurora)
export const auroraGoerli = defineChain(chains.auroraTestnet)
export const avalanche = defineChain(chains.avalanche)
export const avalancheFuji = defineChain(chains.avalancheFuji)
export const baseGoerli = defineChain(chains.baseGoerli)
export const boba = defineChain(chains.boba)
export const bronos = defineChain(chains.bronos)
export const bronosTestnet = defineChain(chains.bronosTestnet)
export const bsc = defineChain(chains.bsc)
export const bscTestnet = defineChain(chains.bscTestnet)
export const canto = defineChain(chains.canto)
export const celo = defineChain({
  ...chains.celo,
  formatters: celoFormatters,
})
export const celoAlfajores = defineChain({
  ...chains.celoAlfajores,
  formatters: celoFormatters,
})
export const crossbell = defineChain(chains.crossbell)
export const evmos = defineChain(chains.evmos)
export const evmosTestnet = defineChain(chains.evmosTestnet)
export const fantom = defineChain(chains.fantom)
export const fantomTestnet = defineChain(chains.fantomTestnet)
export const filecoin = defineChain(chains.filecoin)
export const filecoinCalibration = defineChain(chains.filecoinCalibration)
export const filecoinHyperspace = defineChain(chains.filecoinHyperspace)
export const flare = defineChain(chains.flare)
export const flareTestnet = defineChain(chains.flareTestnet)
export const foundry = defineChain(chains.foundry)
export const goerli = defineChain(chains.goerli)
export const gnosis = defineChain(chains.gnosis)
export const gnosisChiado = defineChain(chains.gnosisChiado)
export const hardhat = defineChain(chains.hardhat)
export const harmonyOne = defineChain(chains.harmonyOne)
export const iotex = defineChain(chains.iotex)
export const iotexTestnet = defineChain(chains.iotexTestnet)
export const localhost = defineChain(chains.localhost)
export const mainnet = defineChain(chains.mainnet)
export const metis = defineChain(chains.metis)
export const metisGoerli = defineChain(chains.metisGoerli)
export const moonbaseAlpha = defineChain(chains.moonbaseAlpha)
export const moonbeam = defineChain(chains.moonbeam)
export const moonriver = defineChain(chains.moonriver)
export const okc = defineChain(chains.okc)
export const optimism = defineChain(chains.optimism)
export const optimismGoerli = defineChain(chains.optimismGoerli)
export const polygon = defineChain(chains.polygon)
export const polygonMumbai = defineChain(chains.polygonMumbai)
export const polygonZkEvmTestnet = defineChain(chains.polygonZkEvmTestnet)
export const sepolia = defineChain(chains.sepolia)
export const shardeumSphinx = defineChain(chains.shardeumSphinx)
export const songbird = defineChain(chains.songbird)
export const songbirdTestnet = defineChain(chains.songbirdTestnet)
export const taraxa = defineChain(chains.taraxa)
export const taraxaTestnet = defineChain(chains.taraxaTestnet)
export const telos = defineChain(chains.telos)
export const telosTestnet = defineChain(chains.telosTestnet)
export const zhejiang = defineChain(chains.zhejiang)
export const zkSync = defineChain(chains.zkSync)
export const zkSyncTestnet = defineChain(chains.zkSyncTestnet)
