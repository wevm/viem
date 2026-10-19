import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { erc20Abi } from '../../constants/abis.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Tokens } from '../../tokens/defineToken.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { Compute } from '../../types/utils.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { writeContractSync } from '../wallet/writeContractSync.js'
import { approve } from './approve.js'
import { resolveAmountDecimals, resolveToken } from './internal.js'

/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await token.approveSync(client, {
 *   amount: 100000000n,
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function approveSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  tokens extends Tokens | undefined = undefined,
>(
  client: Client<Transport, chain, account, undefined, undefined, tokens>,
  parameters: approveSync.Parameters<chain, account, tokens>,
): Promise<approveSync.ReturnValue> {
  const { amount, token, throwOnReceiptRevert = true } = parameters
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await approve.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = approve.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: formatUnits(args.value, resolved) }),
    receipt,
  } as never
}

export namespace approveSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    tokens extends Tokens | undefined = Tokens | undefined,
  > = approve.Parameters<chain, account, tokens>
  export type Args<
    chain extends Chain | undefined = Chain | undefined,
    tokens extends Tokens | undefined = Tokens | undefined,
  > = approve.Args<chain, tokens>
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof erc20Abi,
      'Approval',
      { IndexedOnly: false; Required: true }
    > & {
      /** Token decimals used to derive `formatted`, if known. */
      decimals?: number | undefined
      /** Approved amount formatted with the token's `decimals`, if known. */
      formatted?: string | undefined
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}
