import type { Address, Errors, Hex } from 'ox'
import { ZoneId, ZoneRpcAuthentication } from 'ox/tempo'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Storage from '../../Storage.js'

/**
 * Signs a zone authorization token and stores it for the zone HTTP transport.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.signAuthorizationToken(client, {})
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The authentication object and serialized token.
 */
export async function signAuthorizationToken<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: signAuthorizationToken.Options<account> = {},
): Promise<signAuthorizationToken.ReturnType> {
  const {
    account: account_ = client.account,
    issuedAt = Math.floor(Date.now() / 1000),
    storage = Storage.defaultStorage(),
  } = options
  const expiresAt = options.expiresAt ?? issuedAt + 86_400
  const chain = options.chain ?? client.chain
  if (!chain) throw new Error('`signAuthorizationToken` requires a chain.')
  const account = typeof account_ === 'string' ? Account.from(account_) : account_
  if (!account || account.type !== 'local')
    throw new Error('`account` with `sign` is required.')

  const storageKey = `auth:${account.address.toLowerCase()}:${chain.id}`
  const authentication = ZoneRpcAuthentication.from({
    chainId: chain.id,
    expiresAt,
    issuedAt,
    zoneId: ZoneId.fromChainId(chain.id),
  })
  const payload = ZoneRpcAuthentication.getSignPayload(authentication)
  const signature = await account.sign({ hash: payload })
  const token = ZoneRpcAuthentication.serialize(authentication, { signature })

  await storage.setItem(storageKey, token)
  await storage.setItem(`auth:token:${chain.id}`, token)

  return { authentication, token }
}

export namespace signAuthorizationToken {
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = {
    /** Account to sign with. */
    account?: account | Account.Account | Address.Address | undefined
    /** Chain override. */
    chain?: Chain.Chain | undefined
    /** Token expiry as a unix timestamp. */
    expiresAt?: number | undefined
    /** Token issue time as a unix timestamp. */
    issuedAt?: number | undefined
    /** Storage to persist the token. */
    storage?: Storage.Storage | undefined
  }
  export type ReturnType = {
    /** Authentication object. */
    authentication: ZoneRpcAuthentication.ZoneRpcAuthentication
    /** Serialized authorization token. */
    token: Hex.Hex
  }
  export type ErrorType = Errors.GlobalErrorType
}
