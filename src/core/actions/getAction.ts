import type * as Client from '../Client.js'

/**
 * Retrieves the action attached to the Client at `path` (via `.extend` or an
 * action decorator), falling back to the standalone action `fn` bound to the
 * Client.
 *
 * Core actions consult this for their nested action calls (e.g.
 * `contract.write` dispatches its transaction through
 * `getAction(client, send, 'transaction.send')`), so an action attached to
 * the Client intercepts those calls.
 *
 * The `path` is dot-notation and passed explicitly (instead of being derived
 * from `fn.name`) because actions live on nested Client namespaces and
 * minifiers may mangle `Function.prototype.name`.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * }).extend((client) => ({
 *   transaction: {
 *     send: (options: Actions.transaction.send.Options<typeof mainnet>) =>
 *       Actions.transaction.send(client, { ...options, nonce: 69 }),
 *   },
 * }))
 *
 * // Dispatches its transaction through the `transaction.send` override.
 * const hash = await Actions.contract.write(client, {
 *   abi: Abi.from(['function mint()']),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   functionName: 'mint',
 * })
 * ```
 *
 * @param client - Client.
 * @param fn - Standalone action to fall back to.
 * @param path - Dot-notation path of the action on the Client (e.g. `'transaction.send'`).
 * @returns The Client-attached action at `path`, or `fn` bound to the Client.
 */
export function getAction<options, returnType>(
  client: Client.Client,
  // `any` keeps the Client positions of generic actions out of inference, so
  // instantiated actions (e.g. `send<chain>`) forward their exact signature.
  fn: (client: any, options: options) => returnType,
  path: string,
): (options: options) => returnType {
  const action = path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value as Record<string, unknown> | undefined)?.[key],
      client,
    )
  if (typeof action === 'function')
    return action as (options: options) => returnType
  return (options) => fn(client, options)
}
