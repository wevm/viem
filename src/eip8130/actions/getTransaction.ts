import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash, Hex } from '../../types/misc.js'
import { aaTransactionType, openPayer } from '../constants.js'
import type { AaAccountChange, AaCalls, AaPayer } from '../types/transaction.js'
import {
  fromRpcAccountChange,
  type RpcAccountChange,
} from '../utils/rpcAccountChanges.js'

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
  /** Account changes bundled in this transaction. */
  accountChanges: readonly AaAccountChange[]
  /** Opaque tx metadata (echoed in the receipt). */
  metadata: Hex
  /** Payer wire value (address, or `0x00` for open mode), or `null` for self-pay. */
  payer: AaPayer | null
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

/** Integer as a hex quantity or (older nodes) a JSON number. */
type RawQuantity = Hex | number

/** EIP-8130 body fields of an `eth_getTransactionByHash` response. */
type RawBody = {
  chainId: RawQuantity
  sender: Address | null
  nonceKey: Hex
  /** Standard name; older nodes use `nonceSequence`. */
  nonce?: RawQuantity
  nonceSequence?: RawQuantity
  validAfter: RawQuantity
  validBefore: RawQuantity
  maxFeePerGas: Hex
  maxPriorityFeePerGas: Hex
  /** Standard name; older nodes use `gasLimit`. */
  gas?: RawQuantity
  gasLimit?: RawQuantity
  calls: readonly (readonly { to: Address; value?: Hex; data?: Hex }[])[]
  accountChanges: readonly RpcAccountChange[]
  metadata: Hex
  payer: Hex | null
}

/**
 * Raw `eth_getTransactionByHash` response. The body fields sit at the top level
 * like any other transaction; older nodes nest them under `tx`.
 */
type RawTx = Partial<RawBody> & {
  type: typeof aaTransactionType
  tx?: RawBody
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
 * - Reads the EIP-8130 body fields (and the nested `tx` body of older nodes).
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

  const body = raw.tx ?? (raw as RawBody)

  return {
    type: aaTransactionType,
    hash,
    from: raw.from ?? (body.sender as Address),
    chainId: Number(body.chainId),
    nonceKey: body.nonceKey,
    nonceSequence: Number(body.nonce ?? body.nonceSequence),
    validAfter: Number(body.validAfter),
    validBefore: Number(body.validBefore),
    maxFeePerGas: BigInt(body.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(body.maxPriorityFeePerGas),
    gas: BigInt(body.gas ?? (body.gasLimit as RawQuantity)),
    calls: body.calls.map((phase) =>
      phase.map((call) => ({
        to: call.to,
        ...(call.value && BigInt(call.value) !== 0n
          ? { value: BigInt(call.value) }
          : {}),
        ...(call.data && call.data !== '0x' ? { data: call.data } : {}),
      })),
    ),
    accountChanges: body.accountChanges.map(fromRpcAccountChange),
    metadata: body.metadata,
    payer: fromRpcPayer(body.payer),
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

/**
 * JSON-RPC carries open payer mode as the zero address (or a short all-zero hex
 * such as `0x00`); the wire uses the single byte `0x00`.
 */
function fromRpcPayer(payer: Hex | null): AaPayer | null {
  if (payer === null || payer === undefined) return null
  if (/^0x0*$/.test(payer) && payer !== '0x') return openPayer
  return payer as Address
}
