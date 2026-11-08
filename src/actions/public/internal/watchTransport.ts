import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'

/** Selects the first direct socket member of a fallback transport. */
export function getSubscriptionTransport(client: Client) {
  if (client.transport.type === 'fallback') {
    const transport = client.transport.transports.find(
      (transport: ReturnType<Transport>) =>
        transport.config.type === 'webSocket' ||
        transport.config.type === 'ipc',
    )
    if (!transport) return client.transport
    return transport.value
  }
  return client.transport
}

/** Defaults to subscriptions only when the first transport supports them. */
export function shouldPoll(client: Client) {
  if (client.transport.type === 'webSocket' || client.transport.type === 'ipc')
    return false
  if (
    client.transport.type === 'fallback' &&
    (client.transport.transports[0].config.type === 'webSocket' ||
      client.transport.transports[0].config.type === 'ipc')
  )
    return false
  return true
}
