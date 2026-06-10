import { estimateFeesPerGas } from '../../../actions/public/estimateFeesPerGas.js'
import { readContract } from '../../../actions/public/readContract.js'
import { sendRawTransaction } from '../../../actions/wallet/sendRawTransaction.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { getAction } from '../../../utils/getAction.js'
import { nonceManagerAbi } from '../abis.js'
import type { To8130AccountReturnType } from '../accounts/to8130Account.js'
import { nonceManagerAddress as defaultNonceManagerAddress } from '../constants.js'
import type {
  AaAccountChange,
  AaCall,
  AaCalls,
  TransactionSerializable8130,
} from '../types/transaction.js'
import { type EncodeExecute, encodeWalletCalls } from '../utils/encodeWalletCalls.js'
import type { Signer } from '../utils/signTransaction.js'

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
  /** Override the Nonce Manager precompile address. */
  nonceManagerAddress?: `0x${string}` | undefined
}

/**
 * Builds a fully-populated {@link TransactionSerializable8130} for an
 * `AA_TX_TYPE` transaction, filling chain id, nonce sequence (from the Nonce
 * Manager precompile), and EIP-1559 fees from the client when not provided.
 */
export async function prepareTransaction8130(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: PrepareTransaction8130Parameters,
): Promise<TransactionSerializable8130> {
  const {
    account,
    calls,
    accountChanges,
    payer,
    gas,
    expiry,
    nonceKey = 0n,
    nonceManagerAddress = defaultNonceManagerAddress,
  } = parameters

  const chainId = client.chain?.id
  if (!chainId)
    throw new BaseError('`client` must be configured with a `chain`.')

  let { maxFeePerGas, maxPriorityFeePerGas } = parameters
  if (maxFeePerGas === undefined || maxPriorityFeePerGas === undefined) {
    const fees = await getAction(
      client,
      estimateFeesPerGas,
      'estimateFeesPerGas',
    )({})
    maxFeePerGas ??= fees.maxFeePerGas
    maxPriorityFeePerGas ??= fees.maxPriorityFeePerGas
  }

  let nonceSequence = parameters.nonceSequence
  if (nonceSequence === undefined)
    nonceSequence = BigInt(
      await getAction(
        client,
        readContract,
        'readContract',
      )({
        abi: nonceManagerAbi,
        address: nonceManagerAddress,
        functionName: 'getNonce',
        args: [account.address, nonceKey],
      }),
    )

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
  nonceManagerAddress?: `0x${string}` | undefined
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
