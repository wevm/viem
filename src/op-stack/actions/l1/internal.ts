import type { Address, TransactionReceipt } from 'ox'

import type * as Account from '../../../core/Account.js'
import * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Game from '../../Game.js'
import * as Withdrawal from '../../Withdrawal.js'
import { portal2Abi } from '../../abis.js'

/** Contract-address parameters shared by OP Stack L1 actions. */
export type ContractParameters<names extends string> =
  | ({
      /** OP Stack L2 chain whose L1 contracts should be used. */
      targetChain: Chain.Chain
    } & {
      [key in `${names}Address`]?: undefined
    })
  | ({
      targetChain?: undefined
    } & {
      [key in `${names}Address`]: Address.Address
    })

/** Account parameter shared by OP Stack write actions. */
export type AccountParameter<account extends Account.Account | undefined> =
  account extends Account.Account
    ? { account?: Account.Account | Address.Address | undefined }
    : { account: Account.Account | Address.Address }

/** Transaction parameters shared by OP Stack L1 write actions. */
export type WriteParameters<account extends Account.Account | undefined> =
  AccountParameter<account> & {
    /** Chain the transaction is sent on. @default client.chain */
    chain?: Chain.Chain | null | undefined
    /** Gas limit for the L1 transaction. */
    gas?: bigint | null | undefined
    /** Maximum fee per gas. */
    maxFeePerGas?: bigint | undefined
    /** Maximum priority fee per gas. */
    maxPriorityFeePerGas?: bigint | undefined
    /** Transaction nonce. */
    nonce?: number | undefined
  }

/** Transaction parameters shared by OP Stack L1 gas-estimation actions. */
export type EstimateParameters = {
  /** Account used for the gas estimation. */
  account?: Account.Account | Address.Address | undefined
  /** Chain used to resolve the target contract. @default client.chain */
  chain?: Chain.Chain | undefined
  /** Gas limit for the L1 transaction. */
  gas?: bigint | undefined
  /** Maximum fee per gas. */
  maxFeePerGas?: bigint | undefined
  /** Maximum priority fee per gas. */
  maxPriorityFeePerGas?: bigint | undefined
  /** Transaction nonce. */
  nonce?: number | undefined
}

/** Zero address used for deposit contract creations. */
export const zeroAddress = '0x0000000000000000000000000000000000000000' as const

/** Returns whether a contract call failed because the function is unavailable. */
export function isContractCallUnavailable(error: unknown): boolean {
  if (!(error instanceof ContractError.ContractFunctionExecutionError))
    return false
  if (error.cause instanceof ContractError.ContractFunctionZeroDataError)
    return true
  if (!(error.cause instanceof ContractError.ContractFunctionRevertedError))
    return false

  const { data, raw, reason, signature } = error.cause
  return (
    !data &&
    !signature &&
    (!raw || raw === '0x') &&
    (!reason || reason === 'execution reverted')
  )
}

/**
 * Returns the L2 position a dispute game must anchor past to prove a
 * withdrawal. Super-root games anchor on L2 timestamps instead of L2 block
 * numbers, so the timestamp comes from `l2Timestamp` or the receipt logs.
 */
export async function getGameL2BlockNumber<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: {
    l2BlockNumber: bigint
    l2Timestamp?: bigint | undefined
    portalAddress: Address.Address
    receipt?: TransactionReceipt.TransactionReceipt | undefined
  },
): Promise<bigint> {
  const { l2BlockNumber, l2Timestamp, portalAddress, receipt } = options
  if (typeof l2Timestamp === 'bigint') return l2Timestamp
  const gameType = await read(client, {
    abi: portal2Abi,
    address: portalAddress,
    functionName: 'respectedGameType',
  })
  if (!Game.isSuper(gameType)) return l2BlockNumber
  const timestamp = receipt?.logs[0]?.blockTimestamp
  if (typeof timestamp !== 'bigint')
    throw new Withdrawal.L2TimestampRequiredError({ gameType })
  return timestamp
}

/** Resolves an explicit or target-chain contract address. */
export function getContractAddress(
  options: {
    chain?: Chain.Chain | null | undefined
    targetChain?: Chain.Chain | undefined
  } & Record<string, unknown>,
  name: string,
): Address.Address {
  const address = options[`${name}Address`]
  if (typeof address === 'string') return address as Address.Address

  const { chain, targetChain } = options
  const contract = targetChain?.contracts?.[name]
  if (!contract)
    throw new Chain.DoesNotSupportContract({
      chain: targetChain ?? chain ?? unknownChain,
      contract: { name },
    })

  if ('address' in contract) return contract.address

  const sourceId = chain?.id ?? targetChain?.sourceId
  const resolved = typeof sourceId === 'number' ? contract[sourceId] : undefined
  if (!resolved)
    throw new Chain.DoesNotSupportContract({
      chain: targetChain ?? chain ?? unknownChain,
      contract: { name },
    })
  return resolved.address
}

const unknownChain: Chain.Chain = {
  id: 0,
  name: 'Unknown',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { http: [] },
}
