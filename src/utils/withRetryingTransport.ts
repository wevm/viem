import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import {
  type FallbackTransportRetryFn,
  getFallbackTransportRetry,
} from '../clients/transports/fallback.js'

/**
 * Returns the operation-level retry function of the client's fallback
 * transport, or `undefined` if the client is not backed by a fallback
 * transport.
 *
 * @internal
 */
export function getFallbackRetry(
  client: Client<Transport>,
): FallbackTransportRetryFn | undefined {
  return getFallbackTransportRetry(client.request)
}

/**
 * Clones a client, pinning its `request` function to a single transport of a
 * fallback transport. Actions invoked on the returned client are guaranteed
 * to hit that one transport (with no per-request fallback), so a multi-step
 * operation observes a consistent view of the chain.
 *
 * Note: the clone intentionally does NOT carry over decorated/extended
 * actions. Decorated actions close over the original client (and therefore
 * over the fallback `request`), so copying them would silently escape the
 * pinned transport – e.g. the standard `walletActions`-decorated
 * `prepareTransactionRequest` exists on every wallet client and would undo
 * the pinning entirely. The trade-off is that user-provided action overrides
 * (via `client.extend`) are bypassed while an operation is being retried
 * against individual transports.
 *
 * @internal
 */
export function withRetryingTransport<client extends Client<Transport>>(
  client: client,
  {
    index,
    transport,
  }: {
    index: number
    transport: ReturnType<Transport>
  },
): client {
  const {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    experimental_blockTag,
    key,
    name,
    pollingInterval,
    type,
  } = client

  return {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    experimental_blockTag,
    key,
    name,
    pollingInterval,
    request: transport.request,
    transport: { ...transport.config, ...transport.value },
    type,
    uid: `${client.uid}.${index}`,
  } as client
}
