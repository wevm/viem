import type { Address } from 'abitype'

import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { BaseError } from '../../../errors/base.js'
import type { Account } from '../../../types/account.js'
import type { BlockTag } from '../../../types/block.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import { aaTransactionType } from '../constants.js'

/**
 * Authentication scheme an EIP-8130 actor uses to sign. The node prices the
 * authentication gas deterministically from the auth-blob shape, so declaring
 * the scheme lets `eth_estimateGas` charge the right amount without a real
 * signature.
 */
export type Eip8130AuthScheme = 'secp256k1' | 'p256' | 'webAuthn'

export type EstimateGas8130Parameters = {
  /**
   * Sender address. **Required** — the sender drives actor/policy resolution,
   * and the node returns `INVALID_PARAMS` for an EIP-8130 estimate without it.
   */
  from: Address
  /** Target of the (representative) call being estimated. */
  to?: Address | undefined
  /** Calldata of the call being estimated. */
  data?: Hex | undefined
  /** Native value sent with the call. */
  value?: bigint | undefined
  /** Sender authentication scheme. Defaults to `secp256k1` on the node. */
  senderAuthScheme?: Eip8130AuthScheme | undefined
  /** Override the sender auth-payload byte length (otherwise scheme-derived). */
  senderAuthSize?: number | undefined
  /** Optional sponsoring payer; priced into the estimate when set. */
  payer?: Address | undefined
  /** Payer authentication scheme. Defaults to `secp256k1` on the node. */
  payerAuthScheme?: Eip8130AuthScheme | undefined
  /** Override the payer auth-payload byte length (otherwise scheme-derived). */
  payerAuthSize?: number | undefined
  /** Block number to estimate against. */
  blockNumber?: bigint | undefined
  /** Block tag to estimate against. Defaults to `'pending'`. */
  blockTag?: BlockTag | undefined
}

export type EstimateGas8130ReturnType = bigint

/** Generous cap matching the node's `MAX_AUTH_SIZE`; rejects OOM-sized inputs. */
const maxAuthSize = 8_192

/**
 * Estimates gas for an EIP-8130 (`AA_TX_TYPE`) call via `eth_estimateGas`.
 *
 * Requires a node with the EIP-8130 `eth_estimateGas` extension
 * (base `feat(eip8130): RPC support for estimateGas`). The estimate is a single
 * read-only `simulate` (no binary search): it prices the EIP-8130 intrinsic-gas
 * schedule for the declared authentication scheme plus the executed call.
 *
 * Note: unlike standard `eth_estimateGas`, an EIP-8130 estimate returns the
 * charged gas **even when a phase reverts**, because a reverted EIP-8130 tx is
 * still included (nonce consumed, fee paid).
 */
export async function estimateGas8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: EstimateGas8130Parameters,
): Promise<EstimateGas8130ReturnType> {
  const {
    from,
    to,
    data,
    value,
    senderAuthScheme,
    senderAuthSize,
    payer,
    payerAuthScheme,
    payerAuthSize,
    blockNumber,
    blockTag = 'pending',
  } = parameters

  if (!from)
    throw new BaseError(
      '`from` is required for an EIP-8130 gas estimate: the sender drives actor/policy resolution.',
    )

  for (const size of [senderAuthSize, payerAuthSize])
    if (size !== undefined && (size < 0 || size > maxAuthSize))
      throw new BaseError(
        `auth size ${size} out of range (0..=${maxAuthSize}).`,
      )

  const request: Record<string, unknown> = {
    type: aaTransactionType,
    from,
  }
  if (to !== undefined) request.to = to
  if (data !== undefined) request.data = data
  if (value !== undefined) request.value = numberToHex(value)
  if (senderAuthScheme !== undefined) request.senderAuthScheme = senderAuthScheme
  if (senderAuthSize !== undefined)
    request.senderAuthSize = numberToHex(senderAuthSize)
  if (payer !== undefined) request.payer = payer
  if (payerAuthScheme !== undefined) request.payerAuthScheme = payerAuthScheme
  if (payerAuthSize !== undefined)
    request.payerAuthSize = numberToHex(payerAuthSize)

  const block = blockNumber !== undefined ? numberToHex(blockNumber) : blockTag

  const gas = await (
    client.request as (args: {
      method: 'eth_estimateGas'
      params: [Record<string, unknown>, string]
    }) => Promise<Hex>
  )({ method: 'eth_estimateGas', params: [request, block] })

  return hexToBigInt(gas)
}
