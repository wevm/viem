import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import { aaTransactionType } from '../constants.js'
import type { AaAccountChange, AaCalls } from '../types/transaction.js'

/**
 * Strongly-typed representation of an EIP-8130 (`AA_TX_TYPE`, type `0x79`)
 * transaction as returned by `eth_getTransactionByHash` on a node with the
 * EIP-8130 extension.
 */
export type Transaction = {
  /** EIP-8130 transaction type marker. */
  type: typeof aaTransactionType
  /** Transaction hash (injected from the request — not present in the raw RPC response). */
  hash: Hash
  /** Account address that sent the transaction (sender). */
  from: Address
  /** Chain id. */
  chainId: number
  /** 2D nonce: channel key. */
  nonceKey: Hex
  /** 2D nonce: sequence within the channel. */
  nonceSequence: number
  /** Lower validity bound (unix ms; 0 = no lower bound). */
  validAfter: number
  /** Upper validity bound (unix ms; 0 = no upper bound). */
  validBefore: number
  /** Maximum fee per gas (EIP-1559). */
  maxFeePerGas: bigint
  /** Maximum priority fee per gas (EIP-1559). */
  maxPriorityFeePerGas: bigint
  /** Gas limit. */
  gas: bigint
  /** Ordered list of call phases. */
  calls: AaCalls
  /** Account-configuration changes bundled in this transaction. */
  accountChanges: readonly AaAccountChange[]
  /** Opaque tx metadata (echoed in the receipt). */
  metadata: Hex
  /** Payer address for gas sponsorship, or `null` for self-pay. */
  payer: Address | null
  /** Sender authentication blob. */
  senderAuth: Hex
  /** Payer authentication blob (empty for self-pay). */
  payerAuth: Hex
  /** Gas price at execution. `null` for pending transactions. */
  gasPrice: bigint | null
  /** Block hash of the block containing this transaction, or `null` if pending. */
  blockHash: Hash | null
  /** Block number of the block containing this transaction, or `null` if pending. */
  blockNumber: bigint | null
  /** Zero-based index within the block, or `null` if pending. */
  transactionIndex: number | null
}

export type GetTransactionParameters = {
  /** The hash of the EIP-8130 transaction to fetch. */
  hash: Hash
}

export type GetTransactionReturnType = Transaction

/** Raw RPC response shape for `eth_getTransactionByHash` on an 8130 node. */
type RawTx = {
  type: typeof aaTransactionType
  tx: {
    chainId: number
    sender: Address
    nonceKey: Hex
    nonceSequence: number
    validAfter: number
    validBefore: number
    maxFeePerGas: Hex
    maxPriorityFeePerGas: Hex
    gasLimit: number
    calls: AaCalls
    accountChanges: readonly AaAccountChange[]
    metadata: Hex
    payer: Address | null
  }
  senderAuth: Hex
  payerAuth: Hex
  from: Address
  gasPrice: Hex | null
  blockHash: Hash | null
  blockNumber: Hex | null
  transactionIndex: Hex | null
}

/**
 * Fetches an EIP-8130 (`AA_TX_TYPE`) transaction by hash and returns a
 * fully-typed `Transaction` object.
 *
 * Unlike the generic `getTransaction`, this action:
 * - Understands the nested `tx` body format returned by the EIP-8130 RPC node.
 * - Injects the request `hash` (absent from the raw response) into the result.
 * - Converts all numeric fields from raw form to `bigint` / `number`.
 *
 * @example
 * const tx = await getTransaction(client, { hash: '0xabc...' })
 * console.log(tx.calls)          // AaCalls
 * console.log(tx.accountChanges) // AaAccountChange[]
 * console.log(tx.nonceSequence)  // number
 */
export async function getTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTransactionParameters,
): Promise<GetTransactionReturnType> {
  const { hash } = parameters

  const raw = await (
    client.request as (args: {
      method: 'eth_getTransactionByHash'
      params: [Hash]
    }) => Promise<RawTx | null>
  )({ method: 'eth_getTransactionByHash', params: [hash] })

  if (!raw || raw.type !== aaTransactionType)
    throw new Error(
      `getTransaction: expected type ${aaTransactionType} but got type ${(raw as any)?.type ?? 'null'} for hash ${hash}`,
    )

  const body = raw.tx

  return {
    type: aaTransactionType,
    hash,
    from: raw.from ?? body.sender,
    chainId: body.chainId,
    nonceKey: body.nonceKey,
    nonceSequence: body.nonceSequence,
    validAfter: body.validAfter,
    validBefore: body.validBefore,
    maxFeePerGas: BigInt(body.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(body.maxPriorityFeePerGas),
    gas: BigInt(body.gasLimit),
    calls: body.calls,
    accountChanges: body.accountChanges,
    metadata: body.metadata,
    payer: body.payer,
    senderAuth: raw.senderAuth,
    payerAuth: raw.payerAuth,
    gasPrice: raw.gasPrice ? BigInt(raw.gasPrice) : null,
    blockHash: raw.blockHash ?? null,
    blockNumber: raw.blockNumber ? BigInt(raw.blockNumber) : null,
    transactionIndex: raw.transactionIndex
      ? Number(raw.transactionIndex)
      : null,
  }
}
