import type { Address, Hex } from 'ox'
import { AccountConfig } from 'ox/tempo'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { OneOf } from '../../../core/internal/types.js'
import type { TransactionReceipt } from '../../chainConfig.js'
import { upgrade } from './upgrade.js'

/**
 * Upgrades an existing account to a configurable account in place
 * ([TIP-1113](https://tips.sh/1113)) and waits for confirmation.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempoLocalnet } from 'viem/chains'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const root = Account.fromSecp256k1('0x...')
 * const client = Client.create({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * const { config } = await Actions.accounts.upgradeSync(client, {
 *   account: root,
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The installed configuration, its commitment, and the transaction receipt.
 */
export async function upgradeSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: upgradeSync.Options,
): Promise<upgradeSync.ReturnType> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await upgrade.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  })
  // Pending and (with `throwOnReceiptRevert: false`) reverted receipts carry no upgrade event.
  if ((receipt as TransactionReceipt).status !== 'success')
    return { receipt } as upgradeSync.ReturnType
  const { args } = upgrade.extractEvent(receipt.logs)
  return {
    account: args.account,
    commitment: args.commitment,
    config: AccountConfig.from({
      owners: args.owners,
      salt: args.salt,
      threshold: args.threshold,
      version: 1n,
    }),
    receipt,
  }
}

export namespace upgradeSync {
  export type Options = upgrade.Options

  export type Args = upgrade.Args

  /** Pending and reverted receipts carry no installed configuration. */
  export type ReturnType = OneOf<
    | {
        /** Upgraded account. */
        account: Address.Address
        /** Commitment of the installed configuration. */
        commitment: Hex.Hex
        /** Installed configuration. */
        config: AccountConfig.Config
        /** Transaction receipt. */
        receipt: TransactionReceipt
      }
    | {
        /** Transaction receipt. */
        receipt: TransactionReceipt
      }
  >

  export type ErrorType = upgrade.ErrorType
}
