import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { send } from '../../../core/actions/transaction/send.js'
import { sendSync } from '../../../core/actions/transaction/sendSync.js'
import type {
  IsUndefined,
  MaybeRequired,
  UnionOmit,
} from '../../../core/internal/types.js'
import * as Abis from '../../Abis.js'
import * as ZoneAbis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import {
  defineCall,
  dispatchSend,
  pickWriteParameters,
  pickWriteSyncParameters,
} from '../../internal/utils.js'
import { getEncryptionKey } from './getEncryptionKey.js'
import {
  encryptDepositPayload,
  getAccount,
  getAddress,
  getChain,
  type ZoneWriteParameters,
} from './internal.js'
import type {
  EncryptedPayload,
  PreparedEncryptedDeposit,
  PreparedEncryptedDepositRecipient,
} from './types.js'

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
    /** Refund recipient on the parent chain if the deposit bounces. */
    tempoRefundRecipient: Address.Address
    /** Parent chain ID. */
    chainId: number
    /** Encrypted deposit payload. */
    encrypted: EncryptedPayload
    /** Encryption key index from the portal contract. */
    keyIndex: bigint
    /** Optional deposit memo. */
    memo?: Hex.Hex | undefined
    /** Zone portal address. Defaults to the configured portal registry. */
    portalAddress?: Address.Address | undefined
    /** Recipient address in the zone. */
    recipient: Address.Address
    /** Address that will call the zone portal. */
    sender: Address.Address
    /** Token address to deposit. */
    token: Address.Address
    /** Zone ID. */
    zoneId: number
  }
  export type PlainOptions<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = ZoneWriteParameters<account> &
    Omit<
      Args,
      | 'tempoRefundRecipient'
      | 'chainId'
      | 'encrypted'
      | 'keyIndex'
      | 'recipient'
      | 'sender'
    > & {
      /** Refund recipient on the parent chain. Defaults to `account.address`. */
      tempoRefundRecipient?: Address.Address | undefined
      /** Recipient address in the zone. Defaults to `account.address`. */
      recipient?: Address.Address | undefined
    }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > =
    | PlainOptions<account>
    | (ZoneWriteParameters<account> & PreparedEncryptedDeposit)
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
    const tempoRefundRecipient =
      options.tempoRefundRecipient ?? getAddress(account)
    if ('encrypted' in options) {
      if (options.chainId !== chain.id)
        throw new Error(
          'Prepared encrypted deposit chain ID does not match client chain.',
        )
      return dispatchSend(action, client, {
        ...pickWriteParameters(options),
        ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
        account,
        calls: encryptedDeposit.calls({ ...options, tempoRefundRecipient }),
      })
    }

    const recipient = options.recipient ?? getAddress(account)
    const prepared = await encryptedDeposit.prepare(client, {
      amount: options.amount,
      tempoRefundRecipient,
      memo: options.memo,
      portalAddress: options.portalAddress,
      recipient,
      sender: getAddress(account),
      token: options.token,
      zoneId: options.zoneId,
    })
    return dispatchSend(action, client, {
      ...pickWriteParameters(options),
      ...(action === sendSync ? pickWriteSyncParameters(options) : {}),
      account,
      calls: encryptedDeposit.calls(prepared),
    })
  }

  /** Prepares an encrypted deposit instruction without broadcasting it. */
  export async function prepare<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: prepare.Options<account>,
  ): Promise<prepare.ReturnType> {
    const chain = client.chain
    if (!chain) throw new Error('`chain` is required.')
    const {
      amount,
      tempoRefundRecipient,
      memo,
      portalAddress: portalAddress_,
      recipient,
      sender: sender_ = client.account?.address,
      token,
      zoneId,
      ...rest
    } = options
    if (!sender_) throw new Error('`sender` is required.')
    const sender = sender_
    const portalAddress = portalAddress_ ?? Addresses.zonePortal(zoneId)
    const { keyIndex, publicKey } = await getEncryptionKey(client, {
      ...rest,
      portalAddress,
      zoneId,
    })
    return {
      amount,
      tempoRefundRecipient,
      chainId: chain.id,
      encrypted: await encryptDepositPayload(
        publicKey,
        recipient,
        sender,
        portalAddress,
        keyIndex,
        memo,
      ),
      keyIndex,
      portalAddress,
      sender,
      token,
      zoneId,
    }
  }

  export namespace prepare {
    export type Args = {
      /** Amount of tokens to deposit. */
      amount: bigint
      /** Refund recipient on the parent chain if the deposit bounces. */
      tempoRefundRecipient: Address.Address
      /** Optional deposit memo. */
      memo?: Hex.Hex | undefined
      /** Zone portal address. Defaults to the configured portal registry. */
      portalAddress?: Address.Address | undefined
      /** Recipient address in the zone. */
      recipient: Address.Address
      /** Address that will call the zone portal. */
      sender: Address.Address
      /** Token address to deposit. */
      token: Address.Address
      /** Zone ID. */
      zoneId: number
    }
    export type Options<
      account extends Account.Account | undefined = Account.Account | undefined,
    > = UnionOmit<getEncryptionKey.Options, 'portalAddress' | 'zoneId'> &
      Omit<Args, 'sender'> &
      MaybeRequired<
        {
          /** Address that will call the zone portal. Defaults to `client.account.address`. */
          sender?: Address.Address | undefined
        },
        IsUndefined<account>
      >
    export type ReturnType = PreparedEncryptedDeposit
    export type ErrorType = Errors.GlobalErrorType
  }

  /** Prepares encrypted recipient instructions without constructing a deposit. */
  export async function prepareRecipient<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: prepareRecipient.Options<account>,
  ): Promise<prepareRecipient.ReturnType> {
    const chain = client.chain
    if (!chain) throw new Error('`chain` is required.')
    const {
      memo,
      portalAddress: portalAddress_,
      recipient,
      sender: sender_ = client.account?.address,
      zoneId,
      ...rest
    } = options
    if (!sender_) throw new Error('`sender` is required.')
    const sender = sender_
    const portalAddress = portalAddress_ ?? Addresses.zonePortal(zoneId)
    const { keyIndex, publicKey } = await getEncryptionKey(client, {
      ...rest,
      portalAddress,
      zoneId,
    })
    return {
      chainId: chain.id,
      encrypted: await encryptDepositPayload(
        publicKey,
        recipient,
        sender,
        portalAddress,
        keyIndex,
        memo,
      ),
      keyIndex,
      portalAddress,
      sender,
      zoneId,
    }
  }

  export namespace prepareRecipient {
    /** Arguments for preparing encrypted recipient instructions. */
    export type Args = {
      /** Optional deposit memo. */
      memo?: Hex.Hex | undefined
      /** Zone portal address. Defaults to the configured portal registry. */
      portalAddress?: Address.Address | undefined
      /** Recipient address in the zone. */
      recipient: Address.Address
      /** Address that will call the zone portal. */
      sender: Address.Address
      /** Zone ID. */
      zoneId: number
    }
    /** Options for {@link prepareRecipient}. */
    export type Options<
      account extends Account.Account | undefined = Account.Account | undefined,
    > = UnionOmit<getEncryptionKey.Options, 'portalAddress' | 'zoneId'> &
      Omit<Args, 'sender'> &
      MaybeRequired<
        {
          /** Address that will call the zone portal. Defaults to `client.account.address`. */
          sender?: Address.Address | undefined
        },
        IsUndefined<account>
      >
    /** Return value for {@link prepareRecipient}. */
    export type ReturnType = PreparedEncryptedDepositRecipient
    /** Errors thrown by {@link prepareRecipient}. */
    export type ErrorType = getEncryptionKey.ErrorType | Errors.GlobalErrorType
  }

  /** Defines the calls to approve and deposit encrypted tokens into a zone. */
  export function calls(args: Args | PreparedEncryptedDeposit) {
    const { amount, tempoRefundRecipient, encrypted, keyIndex, token, zoneId } =
      args
    const portalAddress = args.portalAddress ?? Addresses.zonePortal(zoneId)
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
          tempoRefundRecipient,
        ],
      }),
    ] as const
  }
}
