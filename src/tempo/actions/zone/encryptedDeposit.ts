import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { send } from '../../../core/actions/transaction/send.js'
import type { sendSync } from '../../../core/actions/transaction/sendSync.js'
import * as Abis from '../../Abis.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall, dispatchSend } from '../../internal/utils.js'
import * as ZoneAbis from '../../zones/Abis.js'
import { getPortalAddress } from '../../zones/zone.js'
import {
  encryptDepositPayload,
  getAccount,
  getAddress,
  getChain,
  type ZoneWriteParameters,
} from './internal.js'
import type { EncryptedPayload, PreparedEncryptedDeposit } from './types.js'

/**
 * Deposits tokens into a zone on the parent Tempo chain with encrypted recipient and memo.
 *
 * Batches approve and depositEncrypted into a single transaction.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.encryptedDeposit(client, {
 *   amount: 100n,
 *   token: '0x20c0000000000000000000000000000000000001',
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function encryptedDeposit<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: encryptedDeposit.Options<account>,
): Promise<encryptedDeposit.ReturnType> {
  return encryptedDeposit.inner(send, client, options)
}

export namespace encryptedDeposit {
  export type Args = {
    /** Amount of tokens to deposit. */
    amount: bigint
    /** Parent chain ID. */
    chainId: number
    /** Encrypted deposit payload. */
    encrypted: EncryptedPayload
    /** Encryption key index from the portal contract. */
    keyIndex: bigint
    /** Optional deposit memo. */
    memo?: Hex.Hex | undefined
    /** Recipient address in the zone. */
    recipient: Address.Address
    /** Token address to deposit. */
    token: Address.Address
    /** Zone ID. */
    zoneId: number
  }
  export type PlainOptions<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ZoneWriteParameters<account> &
    Omit<Args, 'chainId' | 'encrypted' | 'keyIndex' | 'recipient'> & {
      /** Recipient address in the zone. Defaults to `account.address`. */
      recipient?: Address.Address | undefined
    }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = PlainOptions<account> | (ZoneWriteParameters<account> & PreparedEncryptedDeposit)
  export type ReturnType = send.ReturnType
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof send | typeof sendSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options<account>,
  ): Promise<dispatchSend.ReturnType<action>> {
    const chain = getChain(client, options)
    const account = getAccount(options.account ?? client.account)
    if ('encrypted' in options) {
      if (options.chainId !== chain.id)
        throw new Error('Prepared encrypted deposit chain ID does not match client chain.')
      return dispatchSend(action, client, {
        ...options,
        account,
        calls: encryptedDeposit.calls(options),
      })
    }

    const recipient = options.recipient ?? getAddress(account)
    const prepared = await encryptedDeposit.prepare(client, {
      amount: options.amount,
      memo: options.memo,
      recipient,
      token: options.token,
      zoneId: options.zoneId,
    })
    return dispatchSend(action, client, {
      ...options,
      account,
      calls: encryptedDeposit.calls(prepared),
    })
  }

  /** Prepares an encrypted deposit instruction without broadcasting it. */
  export async function prepare<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
    options: prepare.Options,
  ): Promise<prepare.ReturnType> {
    const chain = client.chain
    if (!chain) throw new Error('`chain` is required.')
    const { amount, memo, recipient, token, zoneId, ...rest } = options
    const portalAddress = getPortalAddress(chain.id, zoneId)
    const [publicKey, keyIndex] = await Promise.all([
      read(client, {
        ...rest,
        address: portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'sequencerEncryptionKey',
      }),
      read(client, {
        ...rest,
        address: portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'encryptionKeyCount',
      }),
    ])
    if (keyIndex === 0n) throw new Error('No sequencer encryption key configured.')
    const resolvedKeyIndex = keyIndex - 1n
    return {
      amount,
      chainId: chain.id,
      encrypted: await encryptDepositPayload(
        { x: publicKey[0], yParity: publicKey[1] },
        recipient,
        portalAddress,
        resolvedKeyIndex,
        memo,
      ),
      keyIndex: resolvedKeyIndex,
      portalAddress,
      token,
      zoneId,
    }
  }

  export namespace prepare {
    export type Args = {
      /** Amount of tokens to deposit. */
      amount: bigint
      /** Optional deposit memo. */
      memo?: Hex.Hex | undefined
      /** Recipient address in the zone. */
      recipient: Address.Address
      /** Token address to deposit. */
      token: Address.Address
      /** Zone ID. */
      zoneId: number
    }
    export type Options = ReadParameters & Args
    export type ReturnType = PreparedEncryptedDeposit
    export type ErrorType = Errors.GlobalErrorType
  }

  /** Defines the calls to approve and deposit encrypted tokens into a zone. */
  export function calls(args: Args | PreparedEncryptedDeposit) {
    const { amount, chainId, encrypted, keyIndex, token, zoneId } = args
    const portalAddress = getPortalAddress(chainId, zoneId)
    return [
      defineCall({
        address: token,
        abi: Abis.tip20,
        functionName: 'approve',
        args: [portalAddress, amount],
      }),
      defineCall({
        address: portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'depositEncrypted',
        args: [
          token,
          amount,
          keyIndex,
          {
            ephemeralPubkeyX: encrypted.ephemeralPubkeyX,
            ephemeralPubkeyYParity: encrypted.ephemeralPubkeyYParity,
            ciphertext: encrypted.ciphertext,
            nonce: encrypted.nonce,
            tag: encrypted.tag,
          },
        ],
      }),
    ] as const
  }
}
