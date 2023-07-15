import * as chains from '@wagmi/chains'

import { defineChain } from '../utils/chain.js'
import { formattersCelo } from './formatters/celo.js'
import { formattersOptimism } from './formatters/optimism.js'
import { serializersCelo } from './serializers/celo.js'

export const arbitrum = /*#__PURE__*/ defineChain(chains.arbitrum)
export const arbitrumGoerli = /*#__PURE__*/ defineChain(chains.arbitrumGoerli)
export const aurora = /*#__PURE__*/ defineChain(chains.aurora)
export const auroraTestnet = /*#__PURE__*/ defineChain(chains.auroraTestnet)
export const avalanche = /*#__PURE__*/ defineChain(chains.avalanche)
export const avalancheFuji = /*#__PURE__*/ defineChain(chains.avalancheFuji)
export const base = /*#__PURE__*/ defineChain(chains.base)
export const baseGoerli = /*#__PURE__*/ defineChain(chains.baseGoerli)
export const boba = /*#__PURE__*/ defineChain(chains.boba)
export const bronos = /*#__PURE__*/ defineChain(chains.bronos)
export const bronosTestnet = /*#__PURE__*/ defineChain(chains.bronosTestnet)
export const bsc = /*#__PURE__*/ defineChain(chains.bsc)
export const bscTestnet = /*#__PURE__*/ defineChain(chains.bscTestnet)
export const canto = /*#__PURE__*/ defineChain(chains.canto)
export const celo = /*#__PURE__*/ defineChain(chains.celo, {
  formatters: formattersCelo,
  serializers: serializersCelo,
})
export const celoAlfajores = /*#__PURE__*/ defineChain(chains.celoAlfajores, {
  formatters: formattersCelo,
  serializers: serializersCelo,
})
export const celoCannoli = /*#__PURE__*/ defineChain(chains.celoCannoli, {
  formatters: formattersCelo,
  serializers: serializersCelo,
})
export const cronos = /*#__PURE__*/ defineChain(chains.cronos)
export const crossbell = /*#__PURE__*/ defineChain(chains.crossbell)
export const dfk = /*#__PURE__*/ defineChain(chains.dfk)
export const dogechain = /*#__PURE__*/ defineChain(chains.dogechain)
export const evmos = /*#__PURE__*/ defineChain(chains.evmos)
export const evmosTestnet = /*#__PURE__*/ defineChain(chains.evmosTestnet)
export const fantom = /*#__PURE__*/ defineChain(chains.fantom)
export const fantomTestnet = /*#__PURE__*/ defineChain(chains.fantomTestnet)
export const filecoin = /*#__PURE__*/ defineChain(chains.filecoin)
export const filecoinCalibration = /*#__PURE__*/ defineChain(
  chains.filecoinCalibration,
)
export const filecoinHyperspace = /*#__PURE__*/ defineChain(
  chains.filecoinHyperspace,
)
export const flare = /*#__PURE__*/ defineChain(chains.flare)
export const flareTestnet = /*#__PURE__*/ defineChain(chains.flareTestnet)
export const foundry = /*#__PURE__*/ defineChain(chains.foundry)
export const iotex = /*#__PURE__*/ defineChain(chains.iotex)
export const iotexTestnet = /*#__PURE__*/ defineChain(chains.iotexTestnet)
export const goerli = /*#__PURE__*/ defineChain(chains.goerli)
export const gnosis = /*#__PURE__*/ defineChain(chains.gnosis)
export const gnosisChiado = /*#__PURE__*/ defineChain(chains.gnosisChiado)
export const haqqMainnet = /*#__PURE__*/ defineChain(chains.haqqMainnet)
export const haqqTestedge2 = /*#__PURE__*/ defineChain(chains.haqqTestedge2)
export const hardhat = /*#__PURE__*/ defineChain(chains.hardhat)
export const harmonyOne = /*#__PURE__*/ defineChain(chains.harmonyOne)
export const klaytn = /*#__PURE__*/ defineChain(chains.klaytn)
export const lineaTestnet = /*#__PURE__*/ defineChain(chains.lineaTestnet)
export const localhost = /*#__PURE__*/ defineChain(chains.localhost)
export const mainnet = /*#__PURE__*/ defineChain(chains.mainnet)
export const metis = /*#__PURE__*/ defineChain(chains.metis)
export const metisGoerli = /*#__PURE__*/ defineChain(chains.metisGoerli)
export const mev = /*#__PURE__*/ defineChain(chains.mev)
export const mevTestnet = /*#__PURE__*/ defineChain(chains.mevTestnet)
export const moonbaseAlpha = /*#__PURE__*/ defineChain(chains.moonbaseAlpha)
export const moonbeam = /*#__PURE__*/ defineChain(chains.moonbeam)
export const moonriver = /*#__PURE__*/ defineChain(chains.moonriver)
export const nexi = /*#__PURE__*/ defineChain(chains.nexi)
export const okc = /*#__PURE__*/ defineChain(chains.okc)
export const optimism = /*#__PURE__*/ defineChain(chains.optimism, {
  formatters: formattersOptimism,
})
export const optimismGoerli = /*#__PURE__*/ defineChain(chains.optimismGoerli, {
  formatters: formattersOptimism,
})
export const polygon = /*#__PURE__*/ defineChain(chains.polygon)
export const polygonMumbai = /*#__PURE__*/ defineChain(chains.polygonMumbai)
export const polygonZkEvm = /*#__PURE__*/ defineChain(chains.polygonZkEvm)
export const polygonZkEvmTestnet = /*#__PURE__*/ defineChain(
  chains.polygonZkEvmTestnet,
)
export const pulsechain = /*#__PURE__*/ defineChain(chains.pulsechain)
export const pulsechainV4 = /*#__PURE__*/ defineChain(chains.pulsechainV4)
export const scrollTestnet = /*#__PURE__*/ defineChain(chains.scrollTestnet)
export const sepolia = /*#__PURE__*/ defineChain(chains.sepolia)
export const skaleBlockBrawlers = /*#__PURE__*/ defineChain(
  chains.skaleBlockBrawlers,
)
export const skaleCalypso = /*#__PURE__*/ defineChain(chains.skaleCalypso)
export const skaleCalypsoTestnet = /*#__PURE__*/ defineChain(
  chains.skaleCalypsoTestnet,
)
export const skaleChaosTestnet = /*#__PURE__*/ defineChain(
  chains.skaleChaosTestnet,
)
export const skaleCryptoBlades = /*#__PURE__*/ defineChain(
  chains.skaleCryptoBlades,
)
export const skaleCryptoColosseum = /*#__PURE__*/ defineChain(
  chains.skaleCryptoColosseum,
)
export const skaleEuropa = /*#__PURE__*/ defineChain(chains.skaleEuropa)
export const skaleEuropaTestnet = /*#__PURE__*/ defineChain(
  chains.skaleEuropaTestnet,
)
export const skaleExorde = /*#__PURE__*/ defineChain(chains.skaleExorde)
export const skaleHumanProtocol = /*#__PURE__*/ defineChain(
  chains.skaleHumanProtocol,
)
export const skaleNebula = /*#__PURE__*/ defineChain(chains.skaleNebula)
export const skaleNebulaTestnet = /*#__PURE__*/ defineChain(
  chains.skaleNebulaTestnet,
)
export const skaleRazor = /*#__PURE__*/ defineChain(chains.skaleRazor)
export const skaleTitan = /*#__PURE__*/ defineChain(chains.skaleTitan)
export const skaleTitanTestnet = /*#__PURE__*/ defineChain(
  chains.skaleTitanTestnet,
)
export const songbird = /*#__PURE__*/ defineChain(chains.songbird)
export const songbirdTestnet = /*#__PURE__*/ defineChain(chains.songbirdTestnet)
export const shardeumSphinx = /*#__PURE__*/ defineChain(chains.shardeumSphinx)
export const syscoin = /*#__PURE__*/ defineChain(chains.syscoin)
export const taraxa = /*#__PURE__*/ defineChain(chains.taraxa)
export const taraxaTestnet = /*#__PURE__*/ defineChain(chains.taraxaTestnet)
export const telos = /*#__PURE__*/ defineChain(chains.telos)
export const telosTestnet = /*#__PURE__*/ defineChain(chains.telosTestnet)
export const thunderTestnet = /*#__PURE__*/ defineChain(chains.thunderTestnet)
export const wanchain = /*#__PURE__*/ defineChain(chains.wanchain)
export const wanchainTestnet = /*#__PURE__*/ defineChain(chains.wanchainTestnet)
export const xdc = /*#__PURE__*/ defineChain(chains.xdc)
export const xdcTestnet = /*#__PURE__*/ defineChain(chains.xdcTestnet)
export const zhejiang = /*#__PURE__*/ defineChain(chains.zhejiang)
export const zkSync = /*#__PURE__*/ defineChain(chains.zkSync)
export const zkSyncTestnet = /*#__PURE__*/ defineChain(chains.zkSyncTestnet)
export const zora = /*#__PURE__*/ defineChain(chains.zora)
export const zoraTestnet = /*#__PURE__*/ defineChain(chains.zoraTestnet)

export type { Chain } from '../types/chain.js'
