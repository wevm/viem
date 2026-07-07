import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Channel from 'ox/tempo/Channel'

import * as CoreAccount from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Account from '../../Account.js'

/**
 * Signs a TIP-20 channel reserve voucher.
 */
export async function signVoucher<
  chain extends Chain.Chain | undefined,
  account extends CoreAccount.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: signVoucher.Options,
): Promise<signVoucher.ReturnType> {
  const {
    account: account_ = client.account,
    chainId = client.chain?.id,
    channel,
    cumulativeAmount,
  } = options
  if (!account_) throw new CoreAccount.NotFoundError()
  if (typeof account_ === 'string')
    throw new Error('account signing is required.')
  if (chainId === undefined) throw new Error('chainId is required.')
  return Account.signVoucher(account_ as CoreAccount.Local, {
    chainId,
    channel,
    cumulativeAmount,
  })
}

export namespace signVoucher {
  export type Args = {
    /** Account to sign with. @default client.account */
    account?: CoreAccount.Account | Hex.Hex | undefined
    /** Channel ID or channel. */
    channel: Channel.computeId.Channel | Hex.Hex
    /** The chain ID. @default client.chain.id */
    chainId?: number | bigint | undefined
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
  }
  export type Options = Args
  export type ReturnType = Hex.Hex
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
