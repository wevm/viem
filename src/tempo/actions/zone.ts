import type { Address } from 'abitype'
import * as Bytes from 'ox/Bytes'
import * as Hex from 'ox/Hex'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import { TokenId, ZoneId, ZoneRpcAuthentication } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type GetContractReturnType,
  getContract,
} from '../../actions/getContract.js'
import {
  type MulticallErrorType,
  type MulticallParameters,
  multicall,
} from '../../actions/public/multicall.js'
import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import {
  type PrepareTransactionRequestErrorType,
  type PrepareTransactionRequestRequest,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import {
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import type { Client } from '../../clients/createClient.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroHash } from '../../constants/bytes.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain, GetChainParameter } from '../../types/chain.js'
import type {
  Compute,
  IsUndefined,
  MaybeRequired,
  UnionOmit,
} from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import { stringify } from '../../utils/stringify.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import {
  WaitForTempoBlockTimeoutError,
  type WaitForTempoBlockTimeoutErrorType,
} from '../errors.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
  WriteSyncParameters,
} from '../internal/types.js'
import {
  defineCall,
  pickWriteParameters,
  pickWriteSyncParameters,
} from '../internal/utils.js'
import * as WithdrawalSenderTag from '../internal/WithdrawalSenderTag.js'
import * as Storage from '../Storage.js'
import type { TransactionReceipt } from '../Transaction.js'

const defaultWithdrawalGas = 10_000_000n

// TODO: Remove this compatibility ABI when T10 support is retired.
// Later Zone deployments append the derived address to these two values.
const sequencerEncryptionKeyAbi = [
  {
    name: 'sequencerEncryptionKey',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { type: 'bytes32', name: 'x' },
      { type: 'uint8', name: 'yParity' },
    ],
  },
] as const

export type EncryptedPayload = {
  ciphertext: Hex.Hex
  ephemeralPubkeyX: Hex.Hex
  ephemeralPubkeyYParity: number
  nonce: Hex.Hex
  tag: Hex.Hex
}

export type PreparedEncryptedDeposit = {
  /** Amount of tokens to deposit. */
  amount: bigint
  /** Parent chain ID (e.g. `42431` for moderato). */
  chainId: number
  /** Encrypted deposit payload. */
  encrypted: EncryptedPayload
  /** Encryption key index from the portal contract. */
  keyIndex: bigint
  /** Zone portal address on the parent chain. */
  portalAddress: Address
  /** Address that will call the Zone portal. */
  sender: Address
  /** Refund recipient on the parent chain if the deposit bounces. */
  tempoRefundRecipient: Address
  /** Token address or ID to deposit. */
  token: TokenId.TokenIdOrAddress
  /** Zone ID (e.g. `7`). */
  zoneId: number
}

export type PreparedEncryptedDepositRecipient = {
  /** Parent chain ID (e.g. `42431` for moderato). */
  chainId: number
  /** Encrypted recipient and memo payload. */
  encrypted: EncryptedPayload
  /** Encryption key index from the portal contract. */
  keyIndex: bigint
  /** Zone portal address on the parent chain. */
  portalAddress: Address
  /** Address that will call the Zone portal. */
  sender: Address
  /** Zone ID (e.g. `7`). */
  zoneId: number
}

/**
 * Deposits tokens into a zone on the parent Tempo chain.
 * Batches approve and deposit into a single transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.deposit(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Deposit parameters.
 * @returns The transaction hash.
 */
export async function deposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: deposit.Parameters<chain, account>,
): Promise<deposit.ReturnValue> {
  const { account = client.account, ...rest } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account_) throw new Error('`account` is required.')

  const recipient = parameters.recipient ?? account_.address
  const tempoRefundRecipient =
    parameters.tempoRefundRecipient ?? account_.address
  const args = {
    ...parameters,
    recipient,
    tempoRefundRecipient,
  }
  return sendTransaction(client, {
    ...rest,
    account,
    calls: deposit.calls(args),
  } as never) as never
}

export namespace deposit {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'recipient' | 'tempoRefundRecipient'> & {
      /** Recipient address in the zone. @default `account.address` */
      recipient?: Address | undefined
      /** Refund recipient on the parent chain. @default `account.address` */
      tempoRefundRecipient?: Address | undefined
    }

  export type Args = {
    /** Amount of tokens to deposit. */
    amount: bigint
    /** Optional deposit memo. @default `0x00...00` */
    memo?: Hex.Hex | undefined
    /** Zone portal address. @default derived from `zoneId`. */
    portalAddress?: Address | undefined
    /** Recipient address in the zone. */
    recipient: Address
    /** Refund recipient on the parent chain if the deposit bounces. */
    tempoRefundRecipient: Address
    /** Token address or ID to deposit. */
    token: TokenId.TokenIdOrAddress
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines the calls to approve and deposit tokens into a zone.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const {
      amount,
      memo = zeroHash,
      recipient,
      tempoRefundRecipient,
      token,
      zoneId,
    } = args
    const portalAddress = args.portalAddress ?? Addresses.zonePortal(zoneId)
    const tokenAddress = TokenId.toAddress(token)
    const approveCall = defineCall({
      address: tokenAddress,
      abi: Abis.tip20,
      functionName: 'approve',
      args: [portalAddress, amount],
    })
    const depositCall = defineCall({
      address: portalAddress,
      abi: Abis.zonePortal,
      functionName: 'deposit',
      args: [tokenAddress, recipient, amount, memo, tempoRefundRecipient],
    })
    return [approveCall, depositCall]
  }
}

/**
 * Deposits tokens into a zone on the parent Tempo chain and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.depositSync(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Deposit parameters.
 * @returns The transaction receipt.
 */
export async function depositSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositSync.Parameters<chain, account>,
): Promise<depositSync.ReturnValue> {
  const {
    account = client.account,
    throwOnReceiptRevert = true,
    ...rest
  } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account_) throw new Error('`account` is required.')

  const recipient = parameters.recipient ?? account_.address
  const tempoRefundRecipient =
    parameters.tempoRefundRecipient ?? account_.address
  const args = {
    ...parameters,
    recipient,
    tempoRefundRecipient,
  }
  const receipt = await sendTransactionSync(client, {
    ...rest,
    account,
    throwOnReceiptRevert,
    calls: deposit.calls(args),
  } as never)
  return { receipt }
}

export namespace depositSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = deposit.Parameters<chain, account>

  export type Args = deposit.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Gets the active sequencer encryption key for a zone.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const { keyIndex, publicKey } = await Actions.zone.getEncryptionKey(client, {
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Public client connected to the parent Tempo chain.
 * @param parameters - Zone encryption key parameters.
 * @returns The active encryption key and its zero-based index.
 */
export async function getEncryptionKey<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getEncryptionKey.Parameters,
): Promise<getEncryptionKey.ReturnValue> {
  const { account, portalAddress: portalAddress_, zoneId, ...rest } = parameters
  const portalAddress = portalAddress_ ?? Addresses.zonePortal(zoneId)
  const [keyCountResult, publicKeyResult] = await multicall(client, {
    ...rest,
    account: account ? parseAccount(account).address : undefined,
    allowFailure: true,
    batchSize: 0,
    contracts: getEncryptionKey.calls({ portalAddress }),
    deployless: true,
  })

  if (keyCountResult.status === 'failure') throw keyCountResult.error
  const keyCount = keyCountResult.result
  if (keyCount === 0n || publicKeyResult.status === 'failure')
    throw keyCount === 0n
      ? new Error('No sequencer encryption key configured.')
      : publicKeyResult.error
  const [x, prefix] = publicKeyResult.result
  PublicKey.assert({ prefix, x: Hex.toBigInt(x) }, { compressed: true })
  return {
    keyIndex: keyCount - 1n,
    publicKey: { prefix: prefix as 2 | 3, x },
  }
}

export namespace getEncryptionKey {
  export type Parameters = UnionOmit<
    MulticallParameters,
    | 'allowFailure'
    | 'account'
    | 'batchSize'
    | 'contracts'
    | 'deployless'
    | 'multicallAddress'
  > &
    Args & {
      /** Account used for the contract reads. */
      account?: Account | Address | undefined
    }

  export type Args = {
    /** Zone portal address. @default derived from `zoneId`. */
    portalAddress?: Address | undefined
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnValue = Compute<{
    /** Zero-based encryption key index. */
    keyIndex: bigint
    /** Active sequencer encryption public key. */
    publicKey: {
      /** SEC1 compressed public key prefix. */
      prefix: 2 | 3
      x: Hex.Hex
    }
  }>

  export type ErrorType =
    | MulticallErrorType
    | PublicKey.assert.ErrorType
    | BaseErrorType

  /**
   * Defines calls to the encryption key count and active sequencer key.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: { portalAddress: Address }) {
    return [
      defineCall({
        address: args.portalAddress,
        abi: Abis.zonePortal,
        functionName: 'encryptionKeyCount',
      }),
      defineCall({
        address: args.portalAddress,
        abi: sequencerEncryptionKeyAbi,
        functionName: 'sequencerEncryptionKey',
      }),
    ] as const
  }
}

/**
 * Gets metadata and configuration for a zone portal.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getPortalInfo(client, {
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Public client connected to the parent Tempo chain.
 * @param parameters - Zone portal parameters.
 * @returns The portal metadata and configuration.
 */
export async function getPortalInfo<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getPortalInfo.Parameters,
): Promise<getPortalInfo.ReturnValue> {
  const { portalAddress: portalAddress_, zoneId, ...rest } = parameters
  const portal = getContract({
    abi: Abis.zonePortal,
    address: portalAddress_ ?? Addresses.zonePortal(zoneId),
    client,
  }) as unknown as GetContractReturnType<
    typeof Abis.zonePortal,
    PublicClient<Transport, Chain>
  >
  const [
    admin,
    enabledTokenCount,
    messenger,
    pauseExpiry,
    paused,
    pendingAdmin,
    sequencerCount,
    sequencerSetVersion,
    sequencerThreshold,
    verifier,
  ] = await Promise.all([
    portal.read.admin(rest),
    portal.read.enabledTokenCount(rest),
    portal.read.messenger(rest),
    portal.read.pauseExpiry(rest),
    portal.read.paused(rest),
    portal.read.pendingAdmin(rest),
    portal.read.sequencerCount(rest),
    portal.read.sequencerSetVersion(rest),
    portal.read.sequencerThreshold(rest),
    portal.read.verifier(rest),
  ])
  const [sequencers, enabledTokens] = await Promise.all([
    Promise.all(
      Array.from({ length: Number(sequencerCount) }, (_, index) =>
        portal.read.sequencerAt([BigInt(index)], rest),
      ),
    ),
    Promise.all(
      Array.from({ length: Number(enabledTokenCount) }, (_, index) =>
        portal.read.enabledTokenAt([BigInt(index)], rest),
      ),
    ),
  ])

  return {
    admin,
    enabledTokens,
    messenger,
    pauseExpiry,
    paused,
    pendingAdmin,
    sequencers,
    sequencerSetVersion,
    sequencerThreshold,
    verifier,
  }
}

export namespace getPortalInfo {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Zone portal address. @default derived from `zoneId`. */
    portalAddress?: Address | undefined
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnValue = Compute<{
    /** Portal governance admin. */
    admin: Address
    /** Tokens enabled for deposits into the zone. */
    enabledTokens: readonly Address[]
    /** Zone messenger assigned to the portal. */
    messenger: Address
    /** Timestamp when the current emergency pause expires. */
    pauseExpiry: bigint
    /** Whether the portal is paused. */
    paused: boolean
    /** Pending governance admin. */
    pendingAdmin: Address
    /** Active sequencer addresses. */
    sequencers: readonly Address[]
    /** Version of the active sequencer set. */
    sequencerSetVersion: bigint
    /** Number of sequencers required to attest to a settlement. */
    sequencerThreshold: number
    /** Settlement verifier assigned to the portal. */
    verifier: Address
  }>

  export type ErrorType = ReadContractErrorType | BaseErrorType
}

/**
 * Deposits tokens into a zone on the parent Tempo chain with encrypted
 * recipient and memo. Batches approve and depositEncrypted into a single
 * transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.encryptedDeposit(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Encrypted deposit parameters.
 * @returns The transaction hash.
 */
export async function encryptedDeposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: encryptedDeposit.Parameters<chain, account>,
): Promise<encryptedDeposit.ReturnValue> {
  const chainId = client.chain?.id
  if (!chainId) throw new Error('`chain` is required.')

  const { account = client.account, ...rest } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account_) throw new Error('`account` is required.')

  const tempoRefundRecipient =
    parameters.tempoRefundRecipient ?? account_.address

  if ('encrypted' in parameters) {
    if (parameters.chainId !== chainId) {
      throw new Error(
        'Prepared encrypted deposit chain ID does not match client chain.',
      )
    }
    return sendTransaction(client, {
      ...pickWriteParameters(parameters as never),
      calls: encryptedDeposit.calls({
        ...parameters,
        tempoRefundRecipient,
      }),
    } as never) as never
  }

  const recipient = parameters.recipient ?? account_.address

  const prepared = await encryptedDeposit.prepare(client, {
    amount: parameters.amount,
    memo: parameters.memo,
    portalAddress: parameters.portalAddress,
    recipient,
    sender: account_.address,
    tempoRefundRecipient,
    token: parameters.token,
    zoneId: parameters.zoneId,
  })
  return sendTransaction(client, {
    ...rest,
    account,
    calls: encryptedDeposit.calls(prepared),
  } as never) as never
}

export namespace encryptedDeposit {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    (
      | (Omit<
          Args,
          | 'chainId'
          | 'encrypted'
          | 'keyIndex'
          | 'recipient'
          | 'tempoRefundRecipient'
        > & {
          /** Recipient address in the zone. @default `account.address` */
          recipient?: Address | undefined
          /** Refund recipient on the parent chain. @default `account.address` */
          tempoRefundRecipient?: Address | undefined
        })
      | PreparedEncryptedDeposit
    )

  export type Args = {
    /** Amount of tokens to deposit. */
    amount: bigint
    /** Parent chain ID (e.g. `42431` for moderato). */
    chainId: number
    /** Encrypted deposit payload. */
    encrypted: EncryptedPayload
    /** Encryption key index from the portal contract. */
    keyIndex: bigint
    /** Optional deposit memo. @default `0x00...00` */
    memo?: Hex.Hex | undefined
    /** Zone portal address. @default derived from `zoneId`. */
    portalAddress?: Address | undefined
    /** Recipient address in the zone. */
    recipient: Address
    /** Refund recipient on the parent chain if the deposit bounces. */
    tempoRefundRecipient: Address
    /** Token address or ID to deposit. */
    token: TokenId.TokenIdOrAddress
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Prepares an encrypted deposit instruction without broadcasting it.
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempoModerato,
   *   transport: http(),
   * })
   *
   * const prepared = await Actions.zone.encryptedDeposit.prepare(client, {
   *   token: '0x20c0...0001',
   *   amount: 1_000_000n,
   *   recipient: '0x...',
   *   sender: '0x...',
   *   tempoRefundRecipient: '0x...',
   *   zoneId: 7,
   * })
   * ```
   *
   * @param client - Public client connected to the parent Tempo chain.
   * @param parameters - Encrypted deposit preparation parameters.
   * @returns A prepared encrypted deposit instruction.
   */
  export async function prepare<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: prepare.Parameters<account>,
  ): Promise<prepare.ReturnValue> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')

    const {
      amount,
      memo,
      portalAddress: portalAddress_,
      recipient,
      sender: sender_ = client.account?.address,
      tempoRefundRecipient,
      token,
      zoneId,
      ...rest
    } = parameters
    if (!sender_) throw new Error('`sender` is required.')
    const sender = sender_
    const portalAddress = portalAddress_ ?? Addresses.zonePortal(zoneId)

    const { keyIndex, publicKey } = await getEncryptionKey(client, {
      ...rest,
      portalAddress,
      zoneId,
    })

    const encrypted = await encryptDepositPayload(
      publicKey,
      recipient,
      sender,
      portalAddress,
      keyIndex,
      memo,
    )

    return {
      amount,
      chainId,
      encrypted,
      keyIndex,
      portalAddress,
      sender,
      tempoRefundRecipient,
      token,
      zoneId,
    }
  }

  export namespace prepare {
    export type Parameters<
      account extends Account | undefined = Account | undefined,
    > = ReadParameters &
      Omit<Args, 'sender'> &
      MaybeRequired<
        {
          /** Address that will call the Zone portal. @default `client.account.address` */
          sender?: Address | undefined
        },
        IsUndefined<account>
      >

    export type Args = {
      /** Amount of tokens to deposit. */
      amount: bigint
      /** Optional deposit memo. @default `0x00...00` */
      memo?: Hex.Hex | undefined
      /** Zone portal address. @default derived from `zoneId`. */
      portalAddress?: Address | undefined
      /** Recipient address in the zone. */
      recipient: Address
      /** Address that will call the Zone portal. */
      sender: Address
      /** Refund recipient on the parent chain if the deposit bounces. */
      tempoRefundRecipient: Address
      /** Token address or ID to deposit. */
      token: TokenId.TokenIdOrAddress
      /** Zone ID (e.g. `7`). */
      zoneId: number
    }

    export type ReturnValue = PreparedEncryptedDeposit

    export type ErrorType = getEncryptionKey.ErrorType | BaseErrorType
  }

  /**
   * Prepares encrypted Zone recipient instructions without constructing a token
   * deposit.
   *
   * Use this when another contract or service controls the token movement and
   * only needs the ZonePortal `keyIndex` and encrypted recipient payload.
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempoModerato,
   *   transport: http(),
   * })
   *
   * const recipient = await Actions.zone.encryptedDeposit.prepareRecipient(client, {
   *   recipient: '0x...',
   *   sender: '0x...',
   *   zoneId: 7,
   * })
   * ```
   *
   * @param client - Public client connected to the parent Tempo chain.
   * @param parameters - Encrypted recipient preparation parameters.
   * @returns Prepared encrypted recipient instructions.
   */
  export async function prepareRecipient<
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: prepareRecipient.Parameters<account>,
  ): Promise<prepareRecipient.ReturnValue> {
    const chainId = client.chain?.id
    if (!chainId) throw new Error('`chain` is required.')

    const {
      memo,
      portalAddress: portalAddress_,
      recipient,
      sender: sender_ = client.account?.address,
      zoneId,
      ...rest
    } = parameters
    if (!sender_) throw new Error('`sender` is required.')
    const sender = sender_
    const portalAddress = portalAddress_ ?? Addresses.zonePortal(zoneId)
    const { keyIndex, publicKey } = await getEncryptionKey(client, {
      ...rest,
      portalAddress,
      zoneId,
    })
    const encrypted = await encryptDepositPayload(
      publicKey,
      recipient,
      sender,
      portalAddress,
      keyIndex,
      memo,
    )

    return {
      chainId,
      encrypted,
      keyIndex,
      portalAddress,
      sender,
      zoneId,
    }
  }

  export namespace prepareRecipient {
    export type Parameters<
      account extends Account | undefined = Account | undefined,
    > = ReadParameters &
      Omit<Args, 'sender'> &
      MaybeRequired<
        {
          /** Address that will call the Zone portal. @default `client.account.address` */
          sender?: Address | undefined
        },
        IsUndefined<account>
      >

    export type Args = {
      /** Optional deposit memo. @default `0x00...00` */
      memo?: Hex.Hex | undefined
      /** Zone portal address. @default derived from `zoneId`. */
      portalAddress?: Address | undefined
      /** Recipient address in the zone. */
      recipient: Address
      /** Address that will call the Zone portal. */
      sender: Address
      /** Zone ID (e.g. `7`). */
      zoneId: number
    }

    export type ReturnValue = PreparedEncryptedDepositRecipient

    export type ErrorType = getEncryptionKey.ErrorType | BaseErrorType
  }

  /**
   * Defines the calls to approve and deposit tokens into a zone (encrypted).
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args | PreparedEncryptedDeposit) {
    const { amount, encrypted, keyIndex, tempoRefundRecipient, token, zoneId } =
      args
    const portalAddress = args.portalAddress ?? Addresses.zonePortal(zoneId)
    const tokenAddress = TokenId.toAddress(token)
    const encryptedPayload = {
      ephemeralPubkeyX: encrypted.ephemeralPubkeyX,
      ephemeralPubkeyYParity: encrypted.ephemeralPubkeyYParity,
      ciphertext: encrypted.ciphertext,
      nonce: encrypted.nonce,
      tag: encrypted.tag,
    }
    const approveCall = defineCall({
      address: tokenAddress,
      abi: Abis.tip20,
      functionName: 'approve',
      args: [portalAddress, amount],
    })
    const depositCall = defineCall({
      address: portalAddress,
      abi: Abis.zonePortal,
      functionName: 'depositEncrypted',
      args: [
        tokenAddress,
        amount,
        keyIndex,
        encryptedPayload,
        tempoRefundRecipient,
      ],
    })
    return [approveCall, depositCall]
  }
}

/**
 * Deposits tokens into a zone on the parent Tempo chain with encrypted
 * recipient and memo, and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.encryptedDepositSync(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Encrypted deposit parameters.
 * @returns The transaction receipt.
 */
export async function encryptedDepositSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: encryptedDepositSync.Parameters<chain, account>,
): Promise<encryptedDepositSync.ReturnValue> {
  const chainId = client.chain?.id
  if (!chainId) throw new Error('`chain` is required.')

  const {
    account = client.account,
    throwOnReceiptRevert = true,
    ...rest
  } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account_) throw new Error('`account` is required.')

  const tempoRefundRecipient =
    parameters.tempoRefundRecipient ?? account_.address

  if ('encrypted' in parameters) {
    if (parameters.chainId !== chainId) {
      throw new Error(
        'Prepared encrypted deposit chain ID does not match client chain.',
      )
    }
    const receipt = await sendTransactionSync(client, {
      ...pickWriteParameters(parameters as never),
      ...pickWriteSyncParameters(parameters as never),
      throwOnReceiptRevert,
      calls: encryptedDeposit.calls({
        ...parameters,
        tempoRefundRecipient,
      }),
    } as never)
    return { receipt }
  }

  const recipient = parameters.recipient ?? account_.address

  const prepared = await encryptedDeposit.prepare(client, {
    amount: parameters.amount,
    memo: parameters.memo,
    portalAddress: parameters.portalAddress,
    recipient,
    sender: account_.address,
    tempoRefundRecipient,
    token: parameters.token,
    zoneId: parameters.zoneId,
  })
  const receipt = await sendTransactionSync(client, {
    ...rest,
    account,
    throwOnReceiptRevert,
    calls: encryptedDeposit.calls(prepared),
  } as never)
  return { receipt }
}

export namespace encryptedDepositSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = encryptedDeposit.Parameters<chain, account> &
    WriteSyncParameters<chain, account>

  export type Args = encryptedDeposit.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Returns the authenticated account address and authorization token expiry.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getAuthorizationTokenInfo(client)
 * ```
 *
 * @param client - Zone client.
 * @returns Authorization token info.
 */
export async function getAuthorizationTokenInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
): Promise<getAuthorizationTokenInfo.ReturnType> {
  const info = await client.request<{
    Method: 'zone_getAuthorizationTokenInfo'
    Parameters: []
    ReturnType: getAuthorizationTokenInfo.RpcReturnType
  }>({
    method: 'zone_getAuthorizationTokenInfo',
    params: [],
  })

  return {
    account: info.account,
    expiresAt: Hex.toBigInt(info.expiresAt),
  }
}

export namespace getAuthorizationTokenInfo {
  export type RpcReturnType = {
    account: Address
    expiresAt: Hex.Hex
  }

  export type ReturnType = {
    account: Address
    expiresAt: bigint
  }

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Returns the fee required for a withdrawal from a zone, given a callback gas
 * limit.
 *
 * The client must be connected to the **zone chain**.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const fee = await Actions.zone.getWithdrawalFee(client)
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Optional callback gas limit parameter.
 * @returns The withdrawal fee as a bigint.
 */
export async function getWithdrawalFee<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getWithdrawalFee.Parameters = {},
): Promise<getWithdrawalFee.ReturnType> {
  const { callbackGas = 0n, ...rest } = parameters
  return readContract(client, {
    ...rest,
    address: Addresses.zoneOutbox,
    abi: Abis.zoneOutbox,
    functionName: 'calculateWithdrawalFee',
    args: [callbackGas],
  })
}

export namespace getWithdrawalFee {
  export type Parameters = ReadParameters & {
    /** Gas limit reserved for the withdrawal callback on the parent chain. @default `0n` */
    callbackGas?: bigint | undefined
  }

  export type ReturnType = bigint

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Returns the current zone metadata.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getZoneInfo(client)
 * ```
 *
 * @param client - Zone client.
 * @returns Zone metadata.
 */
export async function getZoneInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>): Promise<getZoneInfo.ReturnType> {
  const info = await client.request<{
    Method: 'zone_getZoneInfo'
    Parameters: []
    ReturnType: getZoneInfo.RpcReturnType
  }>({
    method: 'zone_getZoneInfo',
    params: [],
  })
  const tempoBlockNumber =
    info.tempoBlockNumber ??
    (
      await client.request<{
        Method: 'zone_getDepositStatus'
        Parameters: [Hex.Hex]
        ReturnType: { zoneProcessedThrough: Hex.Hex }
      }>({
        method: 'zone_getDepositStatus',
        params: ['0x0'],
      })
    ).zoneProcessedThrough

  return {
    chainId: Hex.toNumber(info.chainId),
    sequencers: 'sequencers' in info ? info.sequencers : [info.sequencer],
    tempoBlockNumber: Hex.toBigInt(tempoBlockNumber),
    zoneId: Hex.toNumber(info.zoneId),
    zoneTokens: info.zoneTokens,
  }
}

export namespace getZoneInfo {
  export type RpcReturnType = {
    /** Zone chain ID. */
    chainId: Hex.Hex
    /** Latest Tempo block imported by the zone. */
    tempoBlockNumber?: Hex.Hex | undefined
    /** Zone ID. */
    zoneId: Hex.Hex
    /** Enabled zone token addresses. */
    zoneTokens: readonly Address[]
  } & (
    | {
        /** Active sequencer addresses. */
        sequencers: readonly Address[]
      }
    | {
        /** Active sequencer address. */
        sequencer: Address
      }
  )

  export type ReturnType = {
    /** Zone chain ID. */
    chainId: number
    /** Active sequencer addresses. */
    sequencers: readonly Address[]
    /** Latest Tempo block imported by the zone. */
    tempoBlockNumber: bigint
    /** Zone ID. */
    zoneId: number
    /** Enabled zone token addresses. */
    zoneTokens: readonly Address[]
  }

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Waits for a zone to import a Tempo block.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.waitForTempoBlock(client, {
 *   tempoBlockNumber: 42n,
 * })
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Tempo block number and polling options.
 * @returns Zone metadata after the block has been imported.
 */
export async function waitForTempoBlock<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: waitForTempoBlock.Parameters,
): Promise<waitForTempoBlock.ReturnType> {
  const {
    pollingInterval = client.pollingInterval,
    tempoBlockNumber,
    timeout = 60_000,
  } = parameters
  const observerId = stringify([
    'waitForTempoBlock',
    client.uid,
    tempoBlockNumber,
  ])
  const { promise, reject, resolve } =
    withResolvers<waitForTempoBlock.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void
  const cleanup = () => {
    clearTimeout(timer)
    unobserve()
  }

  unobserve = observe(observerId, { reject, resolve }, (emit) => {
    const unpoll = poll(
      async () => {
        try {
          const info = await getZoneInfo(client)
          if (info.tempoBlockNumber < tempoBlockNumber) return
          unpoll()
          emit.resolve(info)
        } catch (error) {
          unpoll()
          emit.reject(error)
        }
      },
      {
        emitOnBegin: true,
        interval: pollingInterval,
      },
    )

    return unpoll
  })

  timer = timeout
    ? setTimeout(() => {
        reject(new WaitForTempoBlockTimeoutError({ tempoBlockNumber }))
      }, timeout)
    : undefined

  return await promise.finally(cleanup)
}

export namespace waitForTempoBlock {
  export type Parameters = {
    /** Polling frequency in milliseconds. @default `client.pollingInterval` */
    pollingInterval?: number | undefined
    /** Tempo block number to wait for. */
    tempoBlockNumber: bigint
    /** Timeout in milliseconds. @default `60_000` */
    timeout?: number | undefined
  }

  export type ReturnType = getZoneInfo.ReturnType

  export type ErrorType =
    | getZoneInfo.ErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForTempoBlockTimeoutErrorType
}

/**
 * Requests a withdrawal from a zone to the parent Tempo chain via the
 * ZoneOutbox contract.
 *
 * The client must be connected to the **zone chain**.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.requestWithdrawal(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Withdrawal parameters.
 * @returns The transaction hash.
 */
export async function requestWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestWithdrawal.Parameters<chain, account>,
): Promise<requestWithdrawal.ReturnValue> {
  const { account = client.account } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const to = parameters.to ?? account_?.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  return sendTransaction(client, {
    ...pickWriteParameters(parameters as never),
    calls: requestWithdrawal.calls(args),
    gas: parameters.gas ?? defaultWithdrawalGas,
  } as never) as never
}

export namespace requestWithdrawal {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. @default `account.address` */
      to?: Address | undefined
    }

  export type Args = {
    /** Amount of tokens to withdraw. */
    amount: bigint
    /** Gas limit reserved for the withdrawal callback on the parent chain. @default `0n` */
    callbackGas?: bigint | undefined
    /** Optional callback data for the recipient. @default `'0x'` */
    data?: Hex.Hex | undefined
    /** Fallback address if callback fails. @default `to` */
    fallbackRecipient?: Address | undefined
    /** Optional withdrawal memo. @default `0x00...00` */
    memo?: Hex.Hex | undefined
    /** Recipient address on the parent Tempo chain. */
    to: Address
    /** Token address or ID to withdraw. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines the calls to approve and request a withdrawal from a zone.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const {
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient = args.to,
      memo = zeroHash,
      to,
      token,
    } = args
    return [
      defineCall({
        address: TokenId.toAddress(token),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [Addresses.zoneOutbox, amount],
      }),
      defineCall({
        address: Addresses.zoneOutbox,
        abi: Abis.zoneOutbox,
        functionName: 'requestWithdrawal',
        args: [
          TokenId.toAddress(token),
          to,
          amount,
          memo,
          callbackGas,
          fallbackRecipient,
          data,
          '0x',
        ],
      }),
    ]
  }

  /**
   * Prepares a zone withdrawal transaction request without broadcasting it.
   *
   * Use this to inspect or modify the populated ZoneOutbox transaction request
   * and its maximum transaction fee before submitting a withdrawal.
   *
   * @example
   * ```ts
   * import { createClient } from 'viem'
   * import { Actions, http, Zone } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: Zone.a,
   *   transport: http(),
   * })
   *
   * const prepared = await Actions.zone.requestWithdrawal.prepare(client, {
   *   token: '0x20c0...0001',
   *   amount: 1_000_000n,
   *   to: '0x...',
   * })
   *
   * console.log(prepared.maxFee)
   * console.log(prepared.request.gas)
   * ```
   *
   * @param client - Zone client.
   * @param parameters - Withdrawal preparation parameters.
   * @returns The prepared transaction request, maximum fee, and withdrawal details.
   */
  export async function prepare<
    chain extends Chain | undefined,
    account extends Account | undefined,
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    client: Client<Transport, chain, account>,
    parameters: prepare.Parameters<
      chain,
      account,
      chainOverride,
      accountOverride
    >,
  ): Promise<
    prepare.ReturnType<chain, account, chainOverride, accountOverride>
  > {
    const {
      account = client.account,
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient,
      memo = zeroHash,
      to: to_,
      token,
      ...transactionRequest
    } = parameters

    const account_ = account ? parseAccount(account) : undefined
    const to = to_ ?? account_?.address
    if (!to) throw new Error('`to` is required.')

    const request = await prepareTransactionRequest(client, {
      ...transactionRequest,
      account,
      calls: requestWithdrawal.calls({
        amount,
        callbackGas,
        data,
        fallbackRecipient,
        memo,
        to,
        token,
      }),
      gas: transactionRequest.gas ?? defaultWithdrawalGas,
    } as never)
    const feePerGas = request.maxFeePerGas ?? request.gasPrice
    if (typeof request.gas !== 'bigint' || typeof feePerGas !== 'bigint')
      throw new Error('Prepared transaction fee parameters are unavailable.')
    const maxFee = ceilDiv(request.gas * feePerGas, 1_000_000_000_000n)

    return {
      amount,
      callbackGas,
      data,
      fallbackRecipient: fallbackRecipient ?? to,
      maxFee,
      memo,
      request,
      to,
      token,
    } as never
  }

  export namespace prepare {
    export type Parameters<
      chain extends Chain | undefined = Chain | undefined,
      account extends Account | undefined = Account | undefined,
      chainOverride extends Chain | undefined = Chain | undefined,
      accountOverride extends Account | Address | undefined =
        | Account
        | Address
        | undefined,
    > = UnionOmit<
      WriteParameters<chain, account>,
      'account' | 'chain' | 'throwOnReceiptRevert'
    > &
      GetAccountParameter<account, accountOverride, false> &
      GetChainParameter<chain, chainOverride> &
      PrepareArgs

    export type PrepareArgs = Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. @default `account.address` */
      to?: Address | undefined
    }

    export type ReturnType<
      chain extends Chain | undefined = Chain | undefined,
      account extends Account | undefined = Account | undefined,
      chainOverride extends Chain | undefined = Chain | undefined,
      accountOverride extends Account | Address | undefined =
        | Account
        | Address
        | undefined,
    > = Compute<{
      /** Amount of tokens to withdraw. */
      amount: bigint
      /** Gas limit reserved for the callback on the parent chain. */
      callbackGas: bigint
      /** Callback data for the recipient. */
      data: Hex.Hex
      /** Fallback address if the callback fails. */
      fallbackRecipient: Address
      /** Maximum Zone transaction fee in fee-token base units. */
      maxFee: bigint
      /** Withdrawal memo. */
      memo: Hex.Hex
      /** Prepared Zone transaction request. */
      request: PrepareTransactionRequestReturnType<
        chain,
        account,
        chainOverride,
        accountOverride,
        PrepareTransactionRequestRequest<chain, chainOverride> & {
          calls: WithdrawalCalls
        }
      >
      /** Recipient address on the parent Tempo chain. */
      to: Address
      /** Token address or ID to withdraw. */
      token: TokenId.TokenIdOrAddress
    }>

    export type ErrorType = PrepareTransactionRequestErrorType | BaseErrorType
  }
}

type WithdrawalCalls = ReturnType<typeof requestWithdrawal.calls>

/**
 * Requests a withdrawal from a zone to the parent Tempo chain and waits for
 * the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, createPublicClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Abis, Actions, Addresses, http as zoneHttp, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: Zone.a,
 *   transport: zoneHttp(),
 * })
 *
 * const { receipt, senderTag } =
 *   await Actions.zone.requestWithdrawalSync(client, {
 *     amount: 1_000_000n,
 *     token: '0x20c0...0001',
 *   })
 *
 * // `senderTag` identifies the indexed WithdrawalProcessed event emitted on
 * // the parent Tempo chain after the withdrawal is processed.
 * const tempoClient = createPublicClient({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const [withdrawal] = await tempoClient.getContractEvents({
 *   address: Addresses.zonePortal(Zone.a.id),
 *   abi: Abis.zonePortal,
 *   eventName: 'WithdrawalProcessed',
 *   args: { senderTag },
 *   fromBlock: 0n,
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Withdrawal parameters.
 * @returns The transaction receipt and sender tag for the parent-chain withdrawal event.
 */
export async function requestWithdrawalSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestWithdrawalSync.Parameters<chain, account>,
): Promise<requestWithdrawalSync.ReturnValue> {
  const { account = client.account, throwOnReceiptRevert = true } = parameters

  if (!account) throw new Error('`account` is required.')
  const account_ = parseAccount(account)

  const to = parameters.to ?? account_.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  const receipt = await sendTransactionSync(client, {
    ...pickWriteParameters(parameters as never),
    ...pickWriteSyncParameters(parameters as never),
    calls: requestWithdrawal.calls(args),
    gas: parameters.gas ?? defaultWithdrawalGas,
    throwOnReceiptRevert,
  } as never)
  const [event] = parseEventLogs({
    abi: Abis.zoneOutbox,
    logs: receipt.logs,
    eventName: 'WithdrawalRequested',
    strict: true,
  })
  if (!event) throw new Error('`WithdrawalRequested` event not found.')
  const senderTag = WithdrawalSenderTag.from({
    fallbackNonce: event.args.fallbackNonce,
    sender: event.args.sender,
    transactionHash: receipt.transactionHash,
  })
  return { receipt, senderTag }
}

export namespace requestWithdrawalSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = requestWithdrawal.Parameters<chain, account> &
    WriteSyncParameters<chain, account>

  export type Args = requestWithdrawal.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Sender tag identifying the indexed parent-chain `WithdrawalProcessed` event. */
    senderTag: Hex.Hex
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Requests a verifiable withdrawal from a zone to the parent Tempo chain via
 * the ZoneOutbox contract. Includes a `revealTo` public key so the sequencer
 * can encrypt the withdrawal details.
 *
 * The client must be connected to the **zone chain**.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.requestVerifiableWithdrawal(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   revealTo: '0x02abc...def',
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Verifiable withdrawal parameters.
 * @returns The transaction hash.
 */
export async function requestVerifiableWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestVerifiableWithdrawal.Parameters<chain, account>,
): Promise<requestVerifiableWithdrawal.ReturnValue> {
  const { account = client.account } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const to = parameters.to ?? account_?.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  return sendTransaction(client, {
    ...pickWriteParameters(parameters as never),
    calls: requestVerifiableWithdrawal.calls(args),
    gas: parameters.gas ?? defaultWithdrawalGas,
  } as never) as never
}

export namespace requestVerifiableWithdrawal {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. @default `account.address` */
      to?: Address | undefined
    }

  export type Args = requestWithdrawal.Args & {
    /** 33-byte compressed secp256k1 public key for encrypted reveal. */
    revealTo: Hex.Hex
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines the calls to approve and request a verifiable withdrawal from a zone.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const {
      amount,
      callbackGas = 0n,
      data = '0x',
      fallbackRecipient = args.to,
      memo = zeroHash,
      revealTo,
      to,
      token,
    } = args
    return [
      defineCall({
        address: TokenId.toAddress(token),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [Addresses.zoneOutbox, amount],
      }),
      defineCall({
        address: Addresses.zoneOutbox,
        abi: Abis.zoneOutbox,
        functionName: 'requestWithdrawal',
        args: [
          TokenId.toAddress(token),
          to,
          amount,
          memo,
          callbackGas,
          fallbackRecipient,
          data,
          revealTo,
        ],
      }),
    ]
  }
}

/**
 * Requests a verifiable withdrawal from a zone to the parent Tempo chain and
 * waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.requestVerifiableWithdrawalSync(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   revealTo: '0x02abc...def',
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Verifiable withdrawal parameters.
 * @returns The transaction receipt.
 */
export async function requestVerifiableWithdrawalSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestVerifiableWithdrawalSync.Parameters<chain, account>,
): Promise<requestVerifiableWithdrawalSync.ReturnValue> {
  const { account = client.account, throwOnReceiptRevert = true } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const to = parameters.to ?? account_?.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  const receipt = await sendTransactionSync(client, {
    ...pickWriteParameters(parameters as never),
    ...pickWriteSyncParameters(parameters as never),
    calls: requestVerifiableWithdrawal.calls(args),
    gas: parameters.gas ?? defaultWithdrawalGas,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace requestVerifiableWithdrawalSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = requestVerifiableWithdrawal.Parameters<chain, account> &
    WriteSyncParameters<chain, account>

  export type Args = requestVerifiableWithdrawal.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Signs a zone authorization token and stores it for the zone HTTP transport.
 *
 * The `zoneId` is derived from `ZoneId.fromChainId(chain.id)` and can be overridden.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { Actions, http, Zone } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: Zone.a,
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.signAuthorizationToken(client)
 * ```
 *
 * @param client - Zone wallet client.
 * @param parameters - Options including optional storage override.
 * @returns The authentication object and serialized token.
 */
export async function signAuthorizationToken<
  chain extends Chain | undefined,
  account extends Account | undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: signAuthorizationToken.Parameters<
    account,
    accountOverride
  > = {} as any,
): Promise<signAuthorizationToken.ReturnType> {
  const {
    account = client.account,
    issuedAt = Math.floor(Date.now() / 1000),
    expiresAt = issuedAt + 86_400,
    storage = Storage.defaultStorage(),
  } = parameters

  const chain = parameters.chain ?? client.chain
  if (!chain) throw new Error('`signAuthorizationToken` requires a chain.')

  const zoneId = parameters.zoneId ?? ZoneId.fromChainId(chain.id)

  const account_ = account ? parseAccount(account) : undefined
  if (!account_ || !account_.sign)
    throw new Error('`account` with `sign` is required.')

  const storageKey = `auth:${account_.address.toLowerCase()}:${chain.id}`

  const authentication = ZoneRpcAuthentication.from({
    chainId: chain.id,
    expiresAt,
    issuedAt,
    zoneId,
  })

  const payload = ZoneRpcAuthentication.getSignPayload(authentication)
  const signature = await account_.sign({ hash: payload })

  const token = ZoneRpcAuthentication.serialize(authentication, {
    signature,
  })

  await storage.setItem(storageKey, token)
  await storage.setItem(`auth:token:${chain.id}`, token)

  return { authentication, token }
}

export namespace signAuthorizationToken {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
    accountOverride extends Account | Address | undefined =
      | Account
      | Address
      | undefined,
  > = GetAccountParameter<account, accountOverride> & {
    /** Chain override. @default `client.chain`. */
    chain?: Chain | undefined
    /** Token expiry as a unix timestamp (seconds). @default `issuedAt + 86_400`. */
    expiresAt?: number | undefined
    /** Token issue time as a unix timestamp (seconds). @default `Date.now() / 1000`. */
    issuedAt?: number | undefined
    /** Storage to persist the token. @default sessionStorage (web) or memory (server). */
    storage?: Storage.Storage | undefined
    /** Zone ID to scope the token to (`0` for unscoped). @default derived from `chain.id`. */
    zoneId?: number | undefined
  }

  export type ReturnType = {
    authentication: ZoneRpcAuthentication.ZoneRpcAuthentication
    token: Hex.Hex
  }

  export type ErrorType = BaseErrorType
}

/**
 * Encrypts a deposit payload (recipient + memo) using ECIES with AES-256-GCM.
 *
 * @internal
 */
async function encryptDepositPayload(
  publicKey: { prefix: 2 | 3; x: Hex.Hex },
  recipient: Address,
  sender: Address,
  portalAddress: Address,
  keyIndex: bigint,
  memo: Hex.Hex = zeroHash,
): Promise<EncryptedPayload> {
  const sequencerPublicKey = PublicKey.from({
    prefix: publicKey.prefix,
    x: Hex.toBigInt(publicKey.x),
  })

  const { privateKey: ephemeralPrivateKey, publicKey: ephemeralPublicKey } =
    Secp256k1.createKeyPair()
  const compressedEphemeral = PublicKey.compress(ephemeralPublicKey)

  const sharedSecret = Secp256k1.getSharedSecret({
    privateKey: ephemeralPrivateKey,
    publicKey: sequencerPublicKey,
    as: 'Bytes',
  })

  const hkdfKey = await globalThis.crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(1),
    'HKDF',
    false,
    ['deriveKey'],
  )
  const aesKey = await globalThis.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode('ecies-aes-key'),
      info: buildDepositHkdfInfo(
        portalAddress,
        keyIndex,
        Hex.fromNumber(compressedEphemeral.x, { size: 32 }),
        sender,
      ) as BufferSource,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )

  const nonce = Bytes.random(12)
  const plaintext = buildDepositPlaintext(recipient, memo)

  const ciphertextWithTag = new Uint8Array(
    await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce as BufferSource, tagLength: 128 },
      aesKey,
      Bytes.from(plaintext) as BufferSource,
    ),
  )

  const ciphertext = ciphertextWithTag.slice(0, -16)
  const tag = ciphertextWithTag.slice(-16)

  return {
    ciphertext: Hex.fromBytes(ciphertext),
    ephemeralPubkeyX: Hex.fromNumber(compressedEphemeral.x, { size: 32 }),
    ephemeralPubkeyYParity: compressedEphemeral.prefix,
    nonce: Hex.fromBytes(nonce),
    tag: Hex.fromBytes(tag),
  }
}

function buildDepositPlaintext(recipient: Address, memo: Hex.Hex): Bytes.Bytes {
  return Bytes.concat(
    Bytes.from(recipient),
    Bytes.from(memo),
    new Uint8Array(12),
  )
}

function buildDepositHkdfInfo(
  portalAddress: Address,
  keyIndex: bigint,
  ephemeralPubkeyX: Hex.Hex,
  sender: Address,
): Bytes.Bytes {
  return Bytes.concat(
    Bytes.from(portalAddress),
    Bytes.fromNumber(keyIndex, { size: 32 }),
    Bytes.from(ephemeralPubkeyX),
    Bytes.from(sender),
  )
}

function ceilDiv(numerator: bigint, denominator: bigint) {
  return (numerator + denominator - 1n) / denominator
}
