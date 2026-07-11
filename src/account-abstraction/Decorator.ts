import type * as Chain from '../core/Chain.js'
import type * as viem_Client from '../core/Client.js'
import type { NoInfer } from '../core/internal/types.js'
import type * as Client from './Client.js'
import type * as EntryPoint from './EntryPoint.js'
import type * as SmartAccount from './SmartAccount.js'
import * as entryPoint from './actions/entryPoint/index.js'
import * as userOperation from './actions/userOperation/index.js'

/** Account-abstraction actions bound to a Bundler Client. */
export type Decorator<
  account extends SmartAccount.SmartAccount | undefined =
    | SmartAccount.SmartAccount
    | undefined,
> = {
  /** EntryPoint actions. */
  entryPoint: {
    /** Returns the EntryPoints supported by the Bundler. */
    getSupported: () => Promise<entryPoint.getSupported.ReturnType>
  }
  /** User Operation actions. */
  userOperation: {
    /** Estimates the gas required for a User Operation. */
    estimateGas: <
      const calls extends readonly unknown[],
      accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
    >(
      options: userOperation.estimateGas.Options<
        account,
        accountOverride,
        calls
      >,
    ) => Promise<userOperation.estimateGas.ReturnType<account, accountOverride>>
    /** Returns a User Operation by hash. */
    get: (
      options: userOperation.get.Options,
    ) => Promise<userOperation.get.ReturnType<EntryPointVersion<account>>>
    /** Returns a User Operation receipt by hash. */
    getReceipt: (
      options: userOperation.getReceipt.Options,
    ) => Promise<
      userOperation.getReceipt.ReturnType<EntryPointVersion<account>>
    >
    /** Prepares a User Operation for estimation or submission. */
    prepare: <
      const calls extends readonly unknown[],
      accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
      const options extends {
        parameters?: readonly userOperation.prepare.Parameter[] | undefined
      } = userOperation.prepare.Options<
        account,
        accountOverride,
        NoInfer<calls>
      >,
    >(
      options: { calls?: calls | undefined } & userOperation.prepare.Options<
        account,
        accountOverride,
        NoInfer<calls>
      > &
        options,
    ) => Promise<
      userOperation.prepare.ReturnType<account, accountOverride, calls, options>
    >
    /** Signs and broadcasts a User Operation. */
    send: <
      const calls extends readonly unknown[],
      accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
    >(
      options: userOperation.send.Options<account, accountOverride, calls>,
    ) => Promise<userOperation.send.ReturnType>
    /** Waits for a User Operation receipt. */
    waitForReceipt: (
      options: userOperation.waitForReceipt.Options,
    ) => Promise<
      userOperation.waitForReceipt.ReturnType<EntryPointVersion<account>>
    >
  }
}

/**
 * Creates account-abstraction actions for a Bundler Client extension.
 *
 * @example
 * ```ts
 * import { Client, accountAbstractionActions, http } from 'viem/account-abstraction'
 *
 * const client = Client.create({ transport: http() })
 *   .extend(accountAbstractionActions())
 * ```
 */
export function accountAbstractionActions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends SmartAccount.SmartAccount | undefined,
  >(
    client: Pick<viem_Client.Client, 'pollingInterval' | 'request' | 'uid'> & {
      account: account
    },
  ): Decorator<account> => {
    // Bundler fields are assigned before the actions are created.
    const bundlerClient = client as unknown as Client.Client<chain, account>

    async function prepare(
      options: userOperation.prepare.Options,
    ): Promise<unknown> {
      const prepare_ = userOperation.prepare as unknown as (
        client: Client.Client,
        options: userOperation.prepare.Options,
      ) => Promise<unknown>
      return prepare_(bundlerClient as Client.Client, options)
    }

    return {
      entryPoint: {
        getSupported: () => entryPoint.getSupported(client),
      },
      userOperation: {
        estimateGas: (options) =>
          userOperation.estimateGas(bundlerClient, options),
        get: (options) =>
          userOperation.get<EntryPointVersion<account>>(client, options),
        getReceipt: (options) =>
          userOperation.getReceipt<EntryPointVersion<account>>(client, options),
        // Binding preserves the exported generic action signature.
        prepare:
          prepare as unknown as Decorator<account>['userOperation']['prepare'],
        send: (options) => userOperation.send(bundlerClient, options),
        waitForReceipt: (options) =>
          userOperation.waitForReceipt<EntryPointVersion<account>>(
            client,
            options,
          ),
      },
    }
  }
}

type EntryPointVersion<account extends SmartAccount.SmartAccount | undefined> =
  account extends {
    entryPoint: { version: infer version extends EntryPoint.Version }
  }
    ? version
    : EntryPoint.Version
