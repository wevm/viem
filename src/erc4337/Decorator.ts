import type * as Chain from '../core/Chain.js'
import type * as viem_Client from '../core/Client.js'
import type { NoInfer } from '../core/internal/types.js'
import type * as BundlerClient from './BundlerClient.js'
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
    /**
     * Returns the EntryPoints supported by the Bundler.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const entryPoints = await client.entryPoint.getSupported()
     * ```
     */
    getSupported: () => Promise<entryPoint.getSupported.ReturnType>
  }
  /** User Operation actions. */
  userOperation: {
    /**
     * Estimates the gas required to execute a User Operation.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const gas = await client.userOperation.estimateGas({
     *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
     * })
     * ```
     */
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
    /**
     * Returns a User Operation and its inclusion information for a given hash.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const userOperation = await client.userOperation.get({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
    get: (
      options: userOperation.get.Options,
    ) => Promise<userOperation.get.ReturnType<EntryPointVersion<account>>>
    /**
     * Returns a User Operation receipt for a given hash.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const receipt = await client.userOperation.getReceipt({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
    getReceipt: (
      options: userOperation.getReceipt.Options,
    ) => Promise<
      userOperation.getReceipt.ReturnType<EntryPointVersion<account>>
    >
    /**
     * Prepares a User Operation by filling missing account, factory, fee, gas,
     * nonce, paymaster, signature, and authorization fields.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const userOperation = await client.userOperation.prepare({
     *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
     * })
     * ```
     */
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
    /**
     * Signs and broadcasts a User Operation to a Bundler.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const hash = await client.userOperation.send({
     *   calls: [{ to: '0x0000000000000000000000000000000000000000' }],
     * })
     * ```
     */
    send: <
      const calls extends readonly unknown[],
      accountOverride extends SmartAccount.SmartAccount | undefined = undefined,
    >(
      options: userOperation.send.Options<account, accountOverride, calls>,
    ) => Promise<userOperation.send.ReturnType>
    /**
     * Waits for a User Operation to be included on a block, then returns its
     * receipt.
     *
     * @example
     * ```ts
     * import { BundlerClient, http } from 'viem/erc4337'
     *
     * const client = BundlerClient.create({
     *   transport: http('https://bundler.example'),
     * })
     * const receipt = await client.userOperation.waitForReceipt({
     *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
     * })
     * ```
     */
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
 * import { BundlerClient, accountAbstractionActions, http } from 'viem/erc4337'
 *
 * const client = BundlerClient.create({ transport: http() })
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
    const bundlerClient = client as unknown as BundlerClient.Client<
      chain,
      account
    >

    async function prepare(
      options: userOperation.prepare.Options,
    ): Promise<unknown> {
      const prepare_ = userOperation.prepare as unknown as (
        client: BundlerClient.Client,
        options: userOperation.prepare.Options,
      ) => Promise<unknown>
      return prepare_(bundlerClient as BundlerClient.Client, options)
    }

    return {
      entryPoint: {
        getSupported: () => entryPoint.getSupported(client),
      },
      userOperation: {
        // Explicit type arguments on the forwarded calls keep every parameter
        // an identical instantiation (inference here re-relates the full
        // Bundler Client surface).
        estimateGas: <
          const calls extends readonly unknown[],
          accountOverride extends SmartAccount.SmartAccount | undefined =
            undefined,
        >(
          options: userOperation.estimateGas.Options<
            account,
            accountOverride,
            calls
          >,
        ) =>
          userOperation.estimateGas<chain, account, calls, accountOverride>(
            bundlerClient,
            options,
          ),
        get: (options) =>
          userOperation.get<EntryPointVersion<account>>(client, options),
        getReceipt: (options) =>
          userOperation.getReceipt<EntryPointVersion<account>>(client, options),
        // Binding preserves the exported generic action signature.
        prepare:
          prepare as unknown as Decorator<account>['userOperation']['prepare'],
        send: <
          const calls extends readonly unknown[],
          accountOverride extends SmartAccount.SmartAccount | undefined =
            undefined,
        >(
          options: userOperation.send.Options<account, accountOverride, calls>,
        ) =>
          userOperation.send<chain, account, calls, accountOverride>(
            bundlerClient,
            options,
          ),
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
