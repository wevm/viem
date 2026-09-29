import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { estimateGas } from '../actions/estimateGas.js'
import { getTransaction } from '../actions/getTransaction.js'
import { getTransactionCount } from '../actions/getTransactionCount.js'
import {
  prepareTransactionRequest,
  sendTransaction,
  sendTransactionSync,
} from '../actions/sendTransaction.js'
import { waitForTransactionReceipt } from '../actions/waitForTransactionReceipt.js'

type Action = (client: any, parameters: any) => any
/** Binds an `(client, parameters)` action to a client-bound `(parameters)` method. */
type Bound<fn extends Action> = (
  parameters: Parameters<fn>[1],
) => ReturnType<fn>

/**
 * AA transaction actions, exposed under a `eip8130` namespace so they don't
 * shadow core client actions with incompatible signatures (viem's `.extend`
 * requires protected actions like `sendTransaction` / `estimateGas` to conform
 * to core shapes). Mirrors the tempo decorator pattern.
 */
export type Eip8130Actions = {
  eip8130: {
    /** Send an AA (`AA_TX_TYPE`) transaction; returns the hash. */
    sendTransaction: Bound<typeof sendTransaction>
    /** Send an AA transaction and await its receipt (`eth_sendRawTransactionSync`). */
    sendTransactionSync: Bound<typeof sendTransactionSync>
    /** Fill an AA transaction body (chain id, nonce, fees). */
    prepareTransactionRequest: Bound<typeof prepareTransactionRequest>
    /** Estimate gas for an AA call/transaction. */
    estimateGas: Bound<typeof estimateGas>
    /** Await an AA receipt (with `eip8130` fields). */
    waitForTransactionReceipt: Bound<typeof waitForTransactionReceipt>
    /** Read a pending/mined AA transaction (non-standard nested body). */
    getTransaction: Bound<typeof getTransaction>
    /** Read the next 2D channel-nonce sequence. */
    getTransactionCount: Bound<typeof getTransactionCount>
  }
}

/**
 * A suite of AA transaction actions, added to a client under `client.eip8130`.
 *
 * Transaction receipts are not included here: spread {@link eip8130ChainConfig}
 * into your chain and core `client.getTransactionReceipt` /
 * `client.waitForTransactionReceipt` return the AA fields natively.
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
    },
  })
}
