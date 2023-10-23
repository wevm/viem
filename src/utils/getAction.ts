import type { Client } from '../clients/createClient.js'

export function getAction<params extends {}, returnType extends {}>(
  client: Client,
  action: (_: any, params: params) => returnType,
) {
  return (params: params): returnType =>
    (
      client as Client & {
        [key: string]: (params: params) => returnType
      }
    )[action.name]?.(params) ?? action(client, params)
}
