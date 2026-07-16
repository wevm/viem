import { estimateFeesPerGas } from '../../../actions/public/estimateFeesPerGas.js'
import { sendRawTransaction } from '../../../actions/wallet/sendRawTransaction.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { getAction } from '../../../utils/getAction.js'
import type { To8130AccountReturnType } from '../accounts/to8130Account.js'
import { nonceKeyMax } from '../constants.js'
import type {
  AaAccountChange,
  AaCall,
  AaCalls,
  TransactionSerializable8130,
} from '../types/transaction.js'
import { type EncodeExecute, encodeWalletCalls } from '../utils/encodeWalletCalls.js'
import type { Signer } from '../utils/signTransaction.js'
import { getTransactionCount8130 } from './getTransactionCount8130.js'

type FeeOverrides = {
  maxFeePerGas?: bigint | undefined
  maxPriorityFeePerGas?: bigint | undefined
}

export type PrepareTransaction8130Parameters = FeeOverrides & {
  account: To8130AccountReturnType
  /** Ordered call phases. */
  calls: AaCalls
  accountChanges?: readonly AaAccountChange[] | undefined
  payer?: { account: Signer; address?: `0x${string}` } | undefined
  /** Required gas budget (AA_TX_TYPE gas estimation is node-specific). */
  gas: bigint
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  expiry?: bigint | undefined
}

/**
 * Builds a fully-populated {@link TransactionSerializable8130} for an
 * `AA_TX_TYPE` transaction, filling chain id, nonce sequence (via
 * `eth_getTransactionCount`'s 2D channel-nonce extension), and EIP-1559 fees
 * from the client when not provided.
 */
export async function prepareTransaction8130(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: PrepareTransaction8130Parameters,
): Promise<TransactionSerializable8130> {
  const { account, calls, accountChanges, payer, gas, expiry, nonceKey = 0n } =
    parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  let { maxFeePerGas, maxPriorityFeePerGas } = parameters
  if (maxFeePerGas === undefined || maxPriorityFeePerGas === undefined) {
    const fees = await getAction(
      client,
      estimateFeesPerGas,
      'estimateFeesPerGas',
    )({ chain: client.chain })
    maxFeePerGas ??= fees.maxFeePerGas
    maxPriorityFeePerGas ??= fees.maxPriorityFeePerGas
  }

  // Resolve the sequence for the selected nonce channel.
  let nonceSequence = parameters.nonceSequence
  if (nonceKey === nonceKeyMax) {
    // Nonce-free (expiring) mode: there is no per-channel counter to read;
    // replay protection relies on `expiry`. Pin the sequence to `0n`.
    if (!expiry || expiry === 0n)
      throw new BaseError(
        '`expiry` is required for nonce-free transactions (`nonceKey` = `NONCE_KEY_MAX`). Build the nonce with `nonce.nonceless({ expiresIn })`.',
      )
    nonceSequence ??= 0n
  } else if (nonceSequence === undefined) {
    // Read the next sequence via `eth_getTransactionCount` (with the 2D
    // `nonce_key` extension). The Nonce Manager precompile is not callable via
    // `eth_call`, so this RPC path is the correct nonce source.
    nonceSequence = await getAction(
      client,
      getTransactionCount8130,
      'getTransactionCount8130',
    )({ address: account.address, nonceKey })
  }

  return {
    chainId,
    from: account.address,
    nonceKey,
    nonceSequence,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gas,
    expiry,
    accountChanges,
    calls,
    payer: payer?.address ?? payer?.account.address,
  }
}

export type SendCalls8130Parameters = FeeOverrides & {
  account: To8130AccountReturnType
  /**
   * Calls to execute. A flat list runs as a single atomic phase; pass a nested
   * array to control phases explicitly.
   */
  calls: readonly AaCall[] | AaCalls
  accountChanges?: readonly AaAccountChange[] | undefined
  payer?: { account: Signer; address?: `0x${string}` } | undefined
  gas: bigint
  nonceKey?: bigint | undefined
  nonceSequence?: bigint | undefined
  expiry?: bigint | undefined
  /**
   * Encoder for value-bearing phases. Defaults to a self-call to the account's
   * `executeBatch`. Override when the wallet bytecode exposes a different
   * executor. See {@link encodeWalletCalls}.
   */
  encodeExecute?: EncodeExecute | undefined
}

function toPhases(calls: SendCalls8130Parameters['calls']): AaCalls {
  if (calls.length === 0) return []
  // Already phased (array of arrays)?
  if (Array.isArray(calls[0])) return calls as AaCalls
  return [calls as readonly AaCall[]]
}

/**
 * Sends an EIP-8130 (`AA_TX_TYPE`) transaction for an account: prepares the
 * transaction body, signs `sender_auth` (and `payer_auth` when sponsored),
 * serializes, and submits via `eth_sendRawTransaction`.
 *
 * @example
 * const hash = await sendCalls8130(client, {
 *   account,
 *   calls: [{ to, data }],
 *   gas: 200_000n,
 * })
 */
export async function sendCalls8130(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: SendCalls8130Parameters,
): Promise<Hex> {
  const { account, calls, payer, encodeExecute, ...rest } = parameters
  const transaction = await prepareTransaction8130(client, {
    ...rest,
    account,
    calls: encodeWalletCalls({
      account: account.address,
      calls: toPhases(calls),
      encodeExecute,
    }),
    payer,
  })
  const serializedTransaction = await account.signTransaction(transaction, {
    payer,
  })
  return getAction(
    client,
    sendRawTransaction,
    'sendRawTransaction',
  )({ serializedTransaction })
}
