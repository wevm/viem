import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SignMessageErrorType as SignMessageErrorType_account } from '../../accounts/utils/signMessage.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type ToHexErrorType,
  stringToHex,
  toHex,
} from '../../utils/encoding/toHex.js'

export type SignMessageParameters<
  TAccount extends Account | undefined = Account | undefined,
> = GetAccountParameter<TAccount> & {
  message: SignableMessage
}

export type SignMessageReturnType = Hex

export type SignMessageErrorType =
  | ParseAccountErrorType
  | RequestErrorType
  | SignMessageErrorType_account
  | ToHexErrorType
  | ErrorType

/**
 * Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/signMessage.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`personal_sign`](https://docs.metamask.io/guide/signing-data.html#personal-sign)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * With the calculated signature, you can:
 * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage.html) to verify the signature,
 * - use [`recoverMessageAddress`](https://viem.sh/docs/utilities/recoverMessageAddress.html) to recover the signing address from a signature.
 *
 * @param client - Client to use
 * @param parameters - {@link SignMessageParameters}
 * @returns The signed message. {@link SignMessageReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signMessage(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   message: 'hello world',
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, custom } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signMessage(client, {
 *   message: 'hello world',
 * })
 */
export async function signMessage<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  {
    account: account_ = client.account,
    message,
  }: SignMessageParameters<TAccount>,
): Promise<SignMessageReturnType> {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signMessage',
    })
  const account = parseAccount(account_)
  if (account.type === 'local') return account.signMessage({ message })

  const message_ = (() => {
    if (typeof message === 'string') return stringToHex(message)
    if (message.raw instanceof Uint8Array) return toHex(message.raw)
    return message.raw
  })()

  return client.request({
    method: 'personal_sign',
    params: [message_, account.address],
  })
}
