import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Value from 'ox/Value'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { resolveAmountDecimals } from '../../../core/actions/token/internal.js'
import { resolveToken } from '../../internal/utils.js'
import { mint } from './mint.js'

/** Mints TIP-20 tokens to an address, and waits for the transaction to be confirmed. */
export async function mintSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mintSync.Options,
): Promise<mintSync.ReturnType> {
  const { amount, token, throwOnReceiptRevert = true } = options
  const { decimals } = resolveToken(client, { token })
  const resolved = resolveAmountDecimals(amount, decimals)
  const receipt = await mint.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  } as never)
  const { args } = mint.extractEvent(receipt.logs)
  return {
    ...args,
    ...(resolved === undefined
      ? {}
      : { decimals: resolved, formatted: Value.format(args.amount, resolved) }),
    receipt,
  } as never
}

export namespace mintSync {
  export type Args = mint.Args
  export type Options = mint.Options
  export type ReturnType = {
    /** Address that received the minted tokens. */
    to: Address.Address
    /** Minted amount, in base units. */
    amount: bigint
    /** Token decimals used to derive `formatted`, if known. */
    decimals?: number | undefined
    /** Minted amount formatted with the token's `decimals`, if known. */
    formatted?: string | undefined
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
