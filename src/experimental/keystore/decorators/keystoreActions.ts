import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { getActorConfig } from '../actions/getActorConfig.js'
import { getConfigSequence } from '../actions/getConfigSequence.js'
import { getLockStatus } from '../actions/getLockStatus.js'
import { getPolicy } from '../actions/getPolicy.js'
import { getSessionSpend } from '../actions/getSessionSpend.js'
import { isActor } from '../actions/isActor.js'
import { isLocked } from '../actions/isLocked.js'
import { validateSignature } from '../actions/validateSignature.js'

type Action = (client: any, parameters: any) => any
/** Binds an `(client, parameters)` action to a client-bound `(parameters)` method. */
type Bound<fn extends Action> = (
  parameters: Parameters<fn>[1],
) => ReturnType<fn>

/** EIP-8130 Keystore read actions, exposed under a `keystore` namespace. */
export type KeystoreActions = {
  keystore: {
    /** Read an account's local/multichain config sequences. */
    getConfigSequence: Bound<typeof getConfigSequence>
    /** Read an actor's on-chain config. */
    getActorConfig: Bound<typeof getActorConfig>
    /** Read an actor's policy binding. */
    getPolicy: Bound<typeof getPolicy>
    /** Whether an actor is authorized. */
    isActor: Bound<typeof isActor>
    /** Whether an account is locked. */
    isLocked: Bound<typeof isLocked>
    /** Full lock status of an account. */
    getLockStatus: Bound<typeof getLockStatus>
    /** Current spend against a session key. */
    getSessionSpend: Bound<typeof getSessionSpend>
    /** Verify a Keystore signature envelope; returns the resolved actor + scope. */
    validateSignature: Bound<typeof validateSignature>
  }
}

/**
 * EIP-8130 Keystore read actions, added to a client under `client.keystore`.
 * Sending goes through `viem/eip8130` (`eip8130Actions`); Keystore accounts
 * plug into it directly.
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { eip8130Actions } from 'viem/eip8130'
 * import { keystoreActions } from 'viem/experimental/keystore'
 *
 * const client = createClient({ chain, transport: http() })
 *   .extend(eip8130Actions())
 *   .extend(keystoreActions())
 *
 * const bound = await client.keystore.isActor({ account, actorId })
 */
export function keystoreActions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): KeystoreActions => ({
    keystore: {
      getConfigSequence: (parameters) => getConfigSequence(client, parameters),
      getActorConfig: (parameters) => getActorConfig(client, parameters),
      getPolicy: (parameters) => getPolicy(client, parameters),
      isActor: (parameters) => isActor(client, parameters),
      isLocked: (parameters) => isLocked(client, parameters),
      getLockStatus: (parameters) => getLockStatus(client, parameters),
      getSessionSpend: (parameters) => getSessionSpend(client, parameters),
      validateSignature: (parameters) => validateSignature(client, parameters),
    },
  })
}
