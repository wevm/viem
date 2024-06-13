import type { Client } from '../clients/createClient.js'

/**
 * Retrieves and returns an action from the client (if exists), and falls
 * back to the tree-shakable action.
 *
 * Useful for extracting overridden actions from a client (ie. if a consumer
 * wants to override the `sendTransaction` implementation).
 */
export function getAction<params extends {}, returnType extends {}>(
  client: Client,
  action: (_: any, params: params) => returnType,
  // Some minifiers drop `Function.prototype.name` or can change function
  // names so that getting the name by reflection through `action.name` will
  // not work.
  name: string,
) {
  type DecoratedClient = Client & {
    [key: string]: (params: params) => returnType
  }

  return (params: params): returnType => {
    if ((client as DecoratedClient)[action.name] !== undefined) {
      return (
        (client as DecoratedClient)[action.name]?.(params) ??
        action(client, params)
      )
    }
    if ((client as DecoratedClient)[name] !== undefined) {
      return (
        (client as DecoratedClient)[name]?.(params) ?? action(client, params)
      )
    }
    return action(client, params)
  }
}
