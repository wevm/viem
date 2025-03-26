import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  AccountNotFoundError,
  type AccountNotFoundErrorType,
} from '../../errors/account.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Authorization } from '../../types/authorization.js'
import type { Chain } from '../../types/chain.js'
import type { PartialBy } from '../../types/utils.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getAction } from '../../utils/getAction.js'
import { getChainId } from '../public/getChainId.js'
import { getTransactionCount } from '../public/getTransactionCount.js'

export type PrepareAuthorizationParameters<
  account extends Account | undefined = Account | undefined,
> = GetAccountParameter<account> &
  PartialBy<Authorization, 'chainId' | 'nonce'> & {
    /**
     * @deprecated Use `sponsor` instead.
     */
    delegate?: true | Address | Account | undefined
    /**
     * Whether the EIP-7702 Transaction will be executed by another Account.
     *
     * If not specified, it will be assumed that the EIP-7702 Transaction will
     * be executed by the Account that signed the Authorization.
     */
    sponsor?: true | Address | Account | undefined
  }

export type PrepareAuthorizationReturnType = Authorization

export type PrepareAuthorizationErrorType =
  | ParseAccountErrorType
  | RequestErrorType
  | AccountNotFoundErrorType
  | ErrorType

/**
 * Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object for signing.
 * This Action will fill the required fields of the Authorization object if they are not provided (e.g. `nonce` and `chainId`).
 *
 * With the prepared Authorization object, you can use [`signAuthorization`](https://viem.sh/experimental/eip7702/signAuthorization) to sign over the Authorization object.
 *
 * @param client - Client to use
 * @param parameters - {@link PrepareAuthorizationParameters}
 * @returns The prepared Authorization object. {@link PrepareAuthorizationReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareAuthorization } from 'viem/experimental'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const authorization = await prepareAuthorization(client, {
 *   account: privateKeyToAccount('0x..'),
 *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 *
 * @example
 * // Account Hoisting
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareAuthorization } from 'viem/experimental'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const authorization = await prepareAuthorization(client, {
 *   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
export async function prepareAuthorization<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: PrepareAuthorizationParameters<account>,
): Promise<PrepareAuthorizationReturnType> {
  const { account: account_ = client.account, chainId, nonce } = parameters

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/experimental/eip7702/prepareAuthorization',
    })
  const account = parseAccount(account_)

  const sponsor = (() => {
    const sponsor_ = parameters.sponsor ?? parameters.delegate
    if (typeof sponsor_ === 'boolean') return sponsor_
    if (sponsor_) return parseAccount(sponsor_)
    return undefined
  })()

  const authorization = {
    contractAddress: parameters.contractAddress ?? parameters.address,
    chainId,
    nonce,
  } as Authorization

  if (typeof authorization.chainId === 'undefined')
    authorization.chainId =
      client.chain?.id ??
      (await getAction(client, getChainId, 'getChainId')({}))

  if (typeof authorization.nonce === 'undefined') {
    authorization.nonce = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({
      address: account.address,
      blockTag: 'pending',
    })
    if (
      !sponsor ||
      (sponsor !== true && isAddressEqual(account.address, sponsor.address))
    )
      authorization.nonce += 1
  }

  return authorization
}
