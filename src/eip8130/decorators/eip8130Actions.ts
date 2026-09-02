import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { estimateGas } from '../actions/estimateGas.js'
import { getActorConfig } from '../actions/getActorConfig.js'
import { getConfigSequence } from '../actions/getConfigSequence.js'
import { getLockStatus } from '../actions/getLockStatus.js'
import { getPolicy } from '../actions/getPolicy.js'
import { getSessionSpend } from '../actions/getSessionSpend.js'
import { getTransaction } from '../actions/getTransaction.js'
import { getTransactionCount } from '../actions/getTransactionCount.js'
import { isActor } from '../actions/isActor.js'
import { isLocked } from '../actions/isLocked.js'
import {
  prepareTransactionRequest,
  sendTransaction,
  sendTransactionSync,
} from '../actions/sendTransaction.js'
import { validateSignature } from '../actions/validateSignature.js'
import { waitForTransactionReceipt } from '../actions/waitForTransactionReceipt.js'

type Action = (client: any, parameters: any) => any
/** Binds an `(client, parameters)` action to a client-bound `(parameters)` method. */
type Bound<fn extends Action> = (
  parameters: Parameters<fn>[1],
) => ReturnType<fn>

/**
 * EIP-8130 actions, exposed under a `eip8130` namespace so they don't shadow
 * core client actions with incompatible signatures (viem's `.extend` requires
 * protected actions like `sendTransaction` / `estimateGas` to conform to core
 * shapes). Mirrors the tempo decorator pattern.
 */
export type Eip8130Actions = {
  eip8130: {
    /** Send an EIP-8130 (`AA_TX_TYPE`) transaction; returns the hash. */
    sendTransaction: Bound<typeof sendTransaction>
    /** Send an EIP-8130 transaction and await its receipt (`eth_sendRawTransactionSync`). */
    sendTransactionSync: Bound<typeof sendTransactionSync>
    /** Fill an EIP-8130 transaction body (chain id, nonce, fees). */
    prepareTransactionRequest: Bound<typeof prepareTransactionRequest>
    /** Estimate gas for an EIP-8130 call/transaction. */
    estimateGas: Bound<typeof estimateGas>
    /** Await an EIP-8130 receipt (with `eip8130` fields). */
    waitForTransactionReceipt: Bound<typeof waitForTransactionReceipt>
    /** Read a pending/mined EIP-8130 transaction (non-standard nested body). */
    getTransaction: Bound<typeof getTransaction>
    /** Read the next 2D channel-nonce sequence. */
    getTransactionCount: Bound<typeof getTransactionCount>
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
    /** Verify an EIP-8130 signature envelope; returns the resolved actor + scope. */
    validateSignature: Bound<typeof validateSignature>
  }
}

/**
 * A suite of EIP-8130 actions, added to a client under `client.eip8130`.
 *
 * Transaction receipts are not included here: spread {@link eip8130ChainConfig}
 * into your chain and core `client.getTransactionReceipt` /
 * `client.waitForTransactionReceipt` return the EIP-8130 fields natively.
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { baseSepolia } from 'viem/chains'
 * import { eip8130Actions } from 'viem/eip8130'
 *
 * const client = createClient({
 *   chain: baseSepolia,
 *   transport: http(),
 * }).extend(eip8130Actions())
 *
 * const hash = await client.eip8130.sendTransaction({
 *   account,
 *   calls: [{ to, data }],
 *   gas: 200_000n,
 * })
 */
export function eip8130Actions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Eip8130Actions => ({
    eip8130: {
      sendTransaction: (parameters) => sendTransaction(client, parameters),
      sendTransactionSync: (parameters) =>
        sendTransactionSync(client, parameters),
      prepareTransactionRequest: (parameters) =>
        prepareTransactionRequest(client, parameters),
      estimateGas: (parameters) => estimateGas(client, parameters),
      waitForTransactionReceipt: (parameters) =>
        waitForTransactionReceipt(client, parameters),
      getTransaction: (parameters) => getTransaction(client, parameters),
      getTransactionCount: (parameters) =>
        getTransactionCount(client, parameters),
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
