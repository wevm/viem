import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { nonceKeyMax } from '../../../eip8130/constants.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { getActorConfig } from '../actions/getActorConfig.js'
import { isActor } from '../actions/isActor.js'
import { NonceScopeError, ScopeMismatchError } from '../errors.js'
import { isNoncelessOnly } from '../keys.js'

export type ResolveNonceKeyParameters = {
  account: {
    address: Address
    actorId?: Hex | undefined
    scope?: number | undefined
  }
  nonceKey?: bigint | undefined
}

/**
 * Resolves the signing actor's scope for nonce-mode selection.
 * On-chain config wins when the actor is bound; a declared handle `scope` is
 * only a fallback for pre-bind sends (create) and must match when both exist.
 */
async function resolveSigningScope(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  account: ResolveNonceKeyParameters['account'],
): Promise<number | undefined> {
  const { actorId, scope: declared } = account
  if (!actorId) return declared

  const bound = await isActor(client, { account: account.address, actorId })
  if (!bound) return declared

  const { scope: onChain } = await getActorConfig(client, {
    account: account.address,
    actorId,
  })
  if (declared !== undefined && declared !== onChain)
    throw new ScopeMismatchError({ declared, onChain })
  return onChain
}

/**
 * Scope-driven nonce mode: an actor may use a sequenced nonce key only if it is
 * admin or holds `SCOPE_NONCE`. A restricted actor without it is confined to
 * nonce-free mode (`NONCE_KEY_MAX`). Prefers chain truth (`getActorConfig`)
 * over a declared handle `scope`, falling back to the declared scope only when
 * the actor is not yet bound (e.g. the create tx).
 */
export async function resolveNonceKey(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: ResolveNonceKeyParameters,
): Promise<bigint | undefined> {
  const { account, nonceKey } = parameters
  const scope = await resolveSigningScope(client, account)
  if (scope === undefined || !isNoncelessOnly(scope)) return nonceKey
  if (nonceKey !== undefined && nonceKey !== nonceKeyMax)
    throw new NonceScopeError({ scope, nonceKey })
  return nonceKeyMax
}
