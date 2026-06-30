import type * as Transport from '../../Transport.js'
import type * as RpcClient from '../../../utils/RpcClient.js'

/**
 * Resolves a subscription function from a transport (or its first fallback),
 * or `undefined` when the transport cannot subscribe (e.g. plain HTTP).
 */
export function getSubscribe(
  transport: Transport.Instance,
): RpcClient.Socket.subscribe.Fn | undefined {
  const primary = (() => {
    if ('transports' in transport) {
      const { transports } = transport as {
        transports: readonly Transport.Instance[]
      }
      return transports[0]
    }
    return transport
  })()
  if (
    primary &&
    'subscribe' in primary &&
    typeof primary.subscribe === 'function'
  )
    return primary.subscribe as RpcClient.Socket.subscribe.Fn
  return undefined
}
