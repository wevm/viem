import type { Address } from 'ox'
import { MultisigConfig } from 'ox/tempo'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { TransactionReceipt } from '../../chainConfig.js'
import { updateConfig } from './updateConfig.js'

/**
 * Replaces a native multisig configuration and waits for confirmation.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom, type EIP1193Provider } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, type MultisigConfig } from 'viem/tempo'
 *
 * declare const provider: EIP1193Provider
 * declare const currentConfig: MultisigConfig.Config
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(provider),
 * })
 *
 * const { receipt } = await Actions.multisig.updateConfigSync(client, {
 *   currentConfig,
 *   nextConfig: {
 *     owners: [{ owner: '0x...', weight: 1 }],
 *     threshold: 1,
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The updated configuration event and transaction receipt.
 */
export async function updateConfigSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: updateConfigSync.Options,
): Promise<updateConfigSync.ReturnType> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await updateConfig.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  })
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as updateConfigSync.ReturnType
  const { args } = updateConfig.extractEvent(receipt.logs)
  return {
    account: args.account,
    config: MultisigConfig.from({
      owners: args.owners,
      salt: args.salt,
      threshold: args.threshold,
      version: args.version,
    }),
    receipt,
  }
}

export namespace updateConfigSync {
  export type Options = updateConfig.Options

  export type Args = updateConfig.Args

  export type ReturnType = {
    account: Address.Address
    config: MultisigConfig.Config
    receipt: TransactionReceipt
  }

  export type ErrorType = updateConfig.ErrorType
}
