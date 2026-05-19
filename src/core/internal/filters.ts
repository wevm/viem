import type * as Hex from 'ox/Hex'

export type Request = (options: {
  method: string
  params?: readonly unknown[] | undefined
}) => Promise<unknown>

export type Client = {
  request: Request
  transport: Transport
}

export type Transport = {
  onResponse?: ((fn: (options: ResponseOptions) => void) => void) | undefined
  request: Request
  type?: string | undefined
}

export type ResponseOptions = {
  method: string
  response: unknown
  status: 'error' | 'success'
  transport: Transport
}

export function createFilterRequestScope(
  client: Client,
  options: createFilterRequestScope.Options,
): createFilterRequestScope.ReturnType {
  const { method } = options
  const requestMap = new Map<Hex.Hex, Request>()

  if (client.transport.type === 'fallback')
    client.transport.onResponse?.(
      ({ method: method_, response, status, transport }) => {
        if (status === 'success' && method === method_)
          requestMap.set(response as Hex.Hex, transport.request)
      },
    )

  return (id) => requestMap.get(id) ?? client.request
}

export declare namespace createFilterRequestScope {
  type Options = {
    method:
      | 'eth_newBlockFilter'
      | 'eth_newFilter'
      | 'eth_newPendingTransactionFilter'
  }

  type ReturnType = (id: Hex.Hex) => Request
}
