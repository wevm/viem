import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, PrivateKeyAccount } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { IsUndefined } from '../../../types/utils.js'
import type { ToAuthMessageParameters } from '../utils/toAuthMessage.js'

export type SignAuthMessageParameters<
  account extends Account | undefined = Account | undefined,
> = ToAuthMessageParameters &
  // TODO: Use `GetAccountParameter` when JSON-RPC method for sign auth message exists.
  (IsUndefined<account> extends true
    ? { account: PrivateKeyAccount }
    : account extends PrivateKeyAccount
      ? { account?: PrivateKeyAccount | undefined }
      : { account: PrivateKeyAccount })

export type SignAuthMessageReturnType = Hex

export type SignAuthMessageErrorType = ErrorType

/**
 * Calculates an [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074) auth signature.
 *
 * With the calculated signature, you can:
 *  - pass it to an EIP-3074 compatible invoker contract,
 *  - use [`verifyAuthMessage`](/experimental/eip3074/verifyAuthMessage) to verify the signature,
 *  - use [`recoverAuthMessageAddress`](/experimental/eip3074/recoverAuthMessageAddress) to recover the signing address from a signature.
 *
 * @param client - Client to use
 * @param parameters - {@link SignAuthMessageParameters}
 * @returns The signed auth message. {@link SignAuthMessageReturnType}
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signAuthMessage } from 'viem/experimental'
 *
 * const account = privateKeyToAccount('0x...')
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const signature = await signAuthMessage(client, {
 *   account,
 *   chainId: 1,
 *   commit: keccak256('0x1234'),
 *   invokerAddress: '0x0000000000000000000000000000000000000000',
 *   nonce: 69,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signAuthMessage } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const signature = await signAuthMessage(client, {
 *   chainId: 1,
 *   commit: keccak256('0x1234'),
 *   invokerAddress: '0x0000000000000000000000000000000000000000',
 *   nonce: 69,
 * })
 */
export async function signAuthMessage<
  chain extends Chain | undefined,
  // TODO: Use `Account` when JSON-RPC method for sign auth message exists.
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    // @ts-expect-error – TODO: Remove when JSON-RPC method for sign auth message exists.
    account = client.account,
    chainId,
    commit,
    invokerAddress,
    nonce,
  }: SignAuthMessageParameters<account>,
): Promise<SignAuthMessageReturnType> {
  if (!account)
    throw new AccountNotFoundError({
      docsPath: '/experimental/eip5792/signAuthMessage',
    })
  return account.experimental_signAuthMessage({
    chainId,
    commit,
    invokerAddress,
    nonce,
  })
}
