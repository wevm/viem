import type { Prettify } from '../types/utils.js'
import type { Chain as BaseChain, ChainContract } from './chain.js'
import type { Hex } from './misc.js'

export interface L2ToL1MessagePasserContract extends ChainContract {
  withdrawalRootStorageSlot: Hex
  msgNonceStorageSlot: Hex
  leftHashesOffset: number
}

// Explicit contract mapping
interface ZircuitContractsMap {
  gasPriceOracle: ChainContract
  l1Block: ChainContract
  l2CrossDomainMessenger: ChainContract
  l2Erc721Bridge: ChainContract
  l2StandardBridge: ChainContract
  l2ToL1MessagePasser: L2ToL1MessagePasserContract
  ensRegistry?: ChainContract
  ensUniversalResolver?: ChainContract
  multicall3?: ChainContract
  universalSignatureVerifier?: ChainContract
}

export type ZircuitContracts = Prettify<ZircuitContractsMap>

export type Chain<
  formatters extends BaseChain['formatters'] | undefined =
    | BaseChain['formatters']
    | undefined,
  custom extends Record<string, unknown> | undefined =
    | Record<string, unknown>
    | undefined,
> = Omit<BaseChain<formatters, custom>, 'contracts'> & {
  contracts?: ZircuitContracts | undefined
}
