import type * as RpcSchema from 'ox/RpcSchema'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type * as Mode from './test/internal/mode.js'
import { mine } from './test/mine.js'
import { revert } from './test/revert.js'
import { setBalance } from './test/setBalance.js'
import { setCode } from './test/setCode.js'
import { setNonce } from './test/setNonce.js'
import { setStorageAt } from './test/setStorageAt.js'
import { snapshot } from './test/snapshot.js'

/** Test action methods attached by `testActions`. */
export type TestActions = {
  /**
   * Mines a number of blocks.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions({ mode: 'anvil' }))
   *
   * await client.test.mine({ blocks: 1n })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  mine: (options: mine.Options) => mine.ReturnType
  /**
   * Reverts the chain state to a previous snapshot.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * const id = await client.test.snapshot()
   * await client.test.revert({ id })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  revert: (options: revert.Options) => revert.ReturnType
  /**
   * Sets an account balance.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * await client.test.setBalance({
   *   address: '0x0000000000000000000000000000000000000000',
   *   value: 1n,
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setBalance: (options: setBalance.Options) => setBalance.ReturnType
  /**
   * Sets the bytecode at an account address.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * await client.test.setCode({
   *   address: '0x0000000000000000000000000000000000000000',
   *   bytecode: '0x6001600055',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setCode: (options: setCode.Options) => setCode.ReturnType
  /**
   * Sets an account nonce.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * await client.test.setNonce({
   *   address: '0x0000000000000000000000000000000000000000',
   *   nonce: 42n,
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setNonce: (options: setNonce.Options) => setNonce.ReturnType
  /**
   * Sets a storage slot value.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * await client.test.setStorageAt({
   *   address: '0x0000000000000000000000000000000000000000',
   *   slot: 0n,
   *   value: '0x0000000000000000000000000000000000000000000000000000000000000000',
   * })
   * ```
   *
   * @param options - Options.
   * @returns Nothing.
   */
  setStorageAt: (options: setStorageAt.Options) => setStorageAt.ReturnType
  /**
   * Snapshots the current chain state.
   *
   * @example
   * ```ts twoslash
   * import { Client, http, testActions } from 'viem'
   *
   * const client = Client.create({ transport: http() })
   *   .extend(testActions())
   *
   * const id = await client.test.snapshot()
   * ```
   *
   * @returns Snapshot ID.
   */
  snapshot: () => snapshot.ReturnType
}

/**
 * Creates a test action decorator.
 *
 * @example
 * ```ts twoslash
 * import { Client, http, testActions } from 'viem'
 *
 * const client = Client.create({ transport: http() })
 *   .extend(testActions({ mode: 'anvil' }))
 *
 * await client.test.mine({ blocks: 1n })
 * ```
 *
 * @param options - Options.
 * @returns Client decorator.
 */
export function testActions(options: testActions.Options = {}) {
  const { mode } = options
  return <
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    transport extends Transport.Transport = Transport.Transport,
    schema extends RpcSchema.Generic | undefined = undefined,
  >(
    client: Client.Client<chain, account, transport, schema>,
  ) => {
    const actionClient = client as unknown as Client.Client<chain>
    const actions: TestActions = {
      mine: (options: mine.Options) => mine(actionClient, { mode, ...options }),
      revert: (options: revert.Options) => revert(actionClient, options),
      setBalance: (options: setBalance.Options) =>
        setBalance(actionClient, { mode, ...options }),
      setCode: (options: setCode.Options) =>
        setCode(actionClient, { mode, ...options }),
      setNonce: (options: setNonce.Options) =>
        setNonce(actionClient, { mode, ...options }),
      setStorageAt: (options: setStorageAt.Options) =>
        setStorageAt(actionClient, { mode, ...options }),
      snapshot: () => snapshot(actionClient),
    }

    return { test: actions }
  }
}

export declare namespace testActions {
  type Options = Mode.Options
}

export { mine, revert, setBalance, setCode, setNonce, setStorageAt, snapshot }
