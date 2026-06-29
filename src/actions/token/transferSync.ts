import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { erc20Abi } from '../../constants/abis.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { Compute } from '../../types/utils.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
import { writeContractSync } from '../wallet/writeContractSync.js'
import { resolveAmountDecimals, resolveToken } from './internal.js'
import { transfer } from './transfer.js'

/**
 * Transfers ERC-20 tokens to another address, and waits for the transaction to
 * be confirmed.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
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
 * const { receipt, ...event } = await token.transferSync(client, {
 *   amount: 100000000n,
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function transferSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: transferSync.Parameters<chain, account>,
): Promise<transferSync.ReturnValue> {
  const { amount, token, throwOnReceiptRevert = true } = parameters
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await transfer.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = transfer.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: formatUnits(args.value, resolved) }),
    receipt,
  } as never
}

export namespace transferSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = transfer.Parameters<chain, account>
  export type Args<chain extends Chain | undefined = Chain | undefined> =
    transfer.Args<chain>
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof erc20Abi,
      'Transfer',
      { IndexedOnly: false; Required: true }
    > & {
      /** Token decimals used to derive `formatted`, if known. */
      decimals?: number | undefined
      /** Transferred amount formatted with the token's `decimals`, if known. */
      formatted?: string | undefined
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}
