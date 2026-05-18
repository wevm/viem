import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { getFallbackRetry as getFallbackTransportRetry } from '../clients/transports/fallback.js'

export function getFallbackRetry(client: Client<Transport>) {
  return getFallbackTransportRetry(client.request)
}

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
