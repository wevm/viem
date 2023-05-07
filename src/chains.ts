import * as chains from '@wagmi/chains'

import type { Address } from 'abitype'

import type { Hex } from './types/misc.js'
import type { Quantity } from './types/rpc.js'
import { defineChain } from './utils/chain.js'
import { defineBlock } from './utils/formatters/block.js'
import { defineTransaction } from './utils/formatters/transaction.js'
import { defineTransactionReceipt } from './utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from './utils/formatters/transactionRequest.js'

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
export const auroraTestnet = defineChain(chains.auroraTestnet)
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
export const cronos = defineChain(chains.cronos)
export const crossbell = defineChain(chains.crossbell)
export const dfk = defineChain(chains.dfk)
export const dogechain = defineChain(chains.dogechain)
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
export const iotex = defineChain(chains.iotex)
export const iotexTestnet = defineChain(chains.iotexTestnet)
export const goerli = defineChain(chains.goerli)
export const gnosis = defineChain(chains.gnosis)
export const gnosisChiado = defineChain(chains.gnosisChiado)
export const hardhat = defineChain(chains.hardhat)
export const harmonyOne = defineChain(chains.harmonyOne)
export const klaytn = defineChain(chains.klaytn)
export const localhost = defineChain(chains.localhost)
export const mainnet = defineChain(chains.mainnet)
export const metis = defineChain(chains.metis)
export const metisGoerli = defineChain(chains.metisGoerli)
export const moonbaseAlpha = defineChain(chains.moonbaseAlpha)
export const moonbeam = defineChain(chains.moonbeam)
export const moonriver = defineChain(chains.moonriver)
export const nexi = defineChain(chains.nexi)
export const okc = defineChain(chains.okc)
export const optimism = defineChain(chains.optimism)
export const optimismGoerli = defineChain(chains.optimismGoerli)
export const polygon = defineChain(chains.polygon)
export const polygonMumbai = defineChain(chains.polygonMumbai)
export const polygonZkEvm = defineChain(chains.polygonZkEvm)
export const polygonZkEvmTestnet = defineChain(chains.polygonZkEvmTestnet)
export const scrollTestnet = defineChain(chains.scrollTestnet)
export const sepolia = defineChain(chains.sepolia)
export const skaleBlockBrawlers = defineChain(chains.skaleBlockBrawlers)
export const skaleCalypso = defineChain(chains.skaleCalypso)
export const skaleCalypsoTestnet = defineChain(chains.skaleCalypsoTestnet)
export const skaleChaosTestnet = defineChain(chains.skaleChaosTestnet)
export const skaleCryptoBlades = defineChain(chains.skaleCryptoBlades)
export const skaleCryptoColosseum = defineChain(chains.skaleCryptoColosseum)
export const skaleEuropa = defineChain(chains.skaleEuropa)
export const skaleEuropaTestnet = defineChain(chains.skaleEuropaTestnet)
export const skaleExorde = defineChain(chains.skaleExorde)
export const skaleHumanProtocol = defineChain(chains.skaleHumanProtocol)
export const skaleNebula = defineChain(chains.skaleNebula)
export const skaleNebulaTestnet = defineChain(chains.skaleNebulaTestnet)
export const skaleRazor = defineChain(chains.skaleRazor)
export const skaleTitan = defineChain(chains.skaleTitan)
export const skaleTitanTestnet = defineChain(chains.skaleTitanTestnet)
export const songbird = defineChain(chains.songbird)
export const songbirdTestnet = defineChain(chains.songbirdTestnet)
export const shardeumSphinx = defineChain(chains.shardeumSphinx)
export const taraxa = defineChain(chains.taraxa)
export const taraxaTestnet = defineChain(chains.taraxaTestnet)
export const telos = defineChain(chains.telos)
export const telosTestnet = defineChain(chains.telosTestnet)
export const wanchain = defineChain(chains.wanchain)
export const wanchainTestnet = defineChain(chains.wanchainTestnet)
export const xdc = defineChain(chains.xdc)
export const xdcTestnet = defineChain(chains.xdcTestnet)
export const zhejiang = defineChain(chains.zhejiang)
export const zkSync = defineChain(chains.zkSync)
export const zkSyncTestnet = defineChain(chains.zkSyncTestnet)

export type { Chain } from './types/chain.js'
