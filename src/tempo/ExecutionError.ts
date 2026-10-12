import type { Hex } from '../types/misc.js'
import type { UnionOmit } from '../types/utils.js'
import {
  type DecodeErrorResultReturnType,
  decodeErrorResult,
} from '../utils/abi/decodeErrorResult.js'
import { formatAbiItem } from '../utils/abi/formatAbiItem.js'
import { toFunctionSelector } from '../utils/hash/toFunctionSelector.js'
import * as Abis from './Abis.js'

type AllAbis = typeof Abis.core
type AbiErrorName = Extract<AllAbis[number], { type: 'error' }>['name']

type DecodedError<error = DecodeErrorResultReturnType<AllAbis>> =
  error extends DecodeErrorResultReturnType<AllAbis>
    ? Omit<error, 'args'> & {
        args: error['args'] | undefined
        data: Hex
        message: string
      }
    : never

/** Decoded execution error from a Tempo precompile revert or selector. */
export type ExecutionError =
  | DecodedError
  | { errorName: 'unknown'; message: string }

/** Execution error metadata suitable for JSON serialization. */
export type Rpc =
  | UnionOmit<DecodedError, 'args'>
  | Extract<ExecutionError, { errorName: 'unknown' }>

/** Human-readable templates keyed by error signature in `Abis.core`, with positional `{0}` placeholders. */
export const messages: Record<`${AbiErrorName}(${string})`, string> = {
  'AbdicationAlreadyScheduled(uint8)':
    'Abdication is already scheduled for capability {0}.',
  'AccountNotAllowed(address)': 'Account {0} is not allowed.',
  'ActiveLeaderRemoved()': 'The active leader cannot be removed.',
  'AddressAlreadyHasValidator()': 'This address already has a validator.',
  'AddressNotReserved()': 'Address is not reserved.',
  'AddressReserved()': 'Address is reserved.',
  'AlreadyInitialized()': 'Already initialized.',
  'AmountExceedsDeposit()': 'Amount exceeds deposit.',
  'AmountNotIncreasing()': 'Amount is not increasing.',
  'BelowMinimumOrderSize(uint128)':
    'Order size is below the minimum allowed ({0}).',
  'CallNotAllowed()': 'This call is not allowed.',
  'CallbackDidNotReturnToZone()': 'The callback did not return to the zone.',
  'CallbackRejected()': 'The callback was rejected.',
  'CannotChangeWithinBlock()': 'Cannot change within the same block.',
  'CapabilityAbdicated(uint8)': 'Capability {0} has been abdicated.',
  'CaptureAmountInvalid()': 'Capture amount is invalid.',
  'ChannelAlreadyExists()': 'Channel already exists.',
  'ChannelNotFound()': 'Channel not found.',
  'CloseNotReady()': 'Channel is not ready to close.',
  'ContractPaused()': 'Contract is paused.',
  'DepositBlockCapacityExceeded(uint64)':
    'The deposit capacity per block exceeds the maximum ({0}).',
  'DepositOverflow()': 'Deposit overflow.',
  'DepositTooSmall()': 'The deposit is too small.',
  'DepositsNotActive()': 'Deposits are not active.',
  'DivisionByZero()': 'Division by zero.',
  'DuplicateAllowedAccount()': 'The allowed account is duplicated.',
  'DuplicateOwner()': 'The owner is duplicated.',
  'DuplicateZoneGateway()': 'The zone gateway is duplicated.',
  'EmptyV1ValidatorSet()': 'Validator set is empty.',
  'EncryptionKeyExpired(uint256,uint64,uint64)':
    'Encryption key {0} has expired.',
  'ExpiringNonceHashNotSet()': 'Expiring nonce hash is not set.',
  'ExpiringNonceReplay()': 'Expiring nonce has already been used.',
  'ExpiringNonceSetFull()': 'Expiring nonce set is full.',
  'ExpiryInPast()': 'Expiry is in the past.',
  'GasFeeRateTooHigh()': 'The gas fee rate is too high.',
  'IdenticalAddresses()': 'Addresses must be different.',
  'IdenticalTokens()':
    'Cannot swap a token for itself — input and output tokens must be different.',
  'IncompatiblePolicyType()': 'Incompatible policy type.',
  'IndexAlreadySet()': 'The index is already set.',
  'IngressAlreadyExists(string)': 'Ingress "{0}" already exists.',
  'InsufficientAllowance()': 'Insufficient allowance.',
  'InsufficientBalance()': 'Insufficient balance.',
  'InsufficientBalance(uint256,uint256,address)':
    'Insufficient balance. Required: {1}, available: {0}.',
  'InsufficientFeeTokenBalance()': 'Insufficient fee token balance.',
  'InsufficientLiquidity()':
    'Not enough liquidity in the order book to fill this trade.',
  'InsufficientOutput()':
    'The output amount is below the slippage minimum — try increasing slippage tolerance.',
  'InsufficientReserves()': 'Insufficient reserves.',
  'InvalidAccount()': 'Invalid account.',
  'InvalidAdmin()': 'Invalid administrator.',
  'InvalidAmount()': 'Invalid amount.',
  'InvalidBaseToken()':
    'This token is not a valid base token for the requested pair.',
  'InvalidBouncebackRecipient()': 'Invalid bounceback recipient.',
  'InvalidCallScope()': 'Invalid call scope.',
  'InvalidCallbackTarget()': 'Invalid callback target.',
  'InvalidCiphertextLength(uint256,uint256)':
    'Invalid ciphertext length. Expected {1}, got {0}.',
  'InvalidClaimAddress()': 'Invalid claim address.',
  'InvalidClosedLoopConfig()': 'Invalid closed-loop configuration.',
  'InvalidConfig()': 'Invalid configuration.',
  'InvalidCurrency()': 'Invalid currency.',
  'InvalidDepositTransition()': 'Invalid deposit transition.',
  'InvalidEncryptionKeyIndex(uint256)': 'Invalid encryption key index ({0}).',
  'InvalidEphemeralPubkey()': 'Invalid ephemeral public key.',
  'InvalidExpiringNonceExpiry()': 'Invalid expiring nonce expiry.',
  'InvalidFlipTick()': 'The flip-order price tick is invalid.',
  'InvalidFormat()': 'Invalid format.',
  'InvalidKeyAuthorizationWitness()': 'Invalid key authorization witness.',
  'InvalidKeyId()': 'Invalid key ID.',
  'InvalidLeader()': 'Invalid leader.',
  'InvalidLogoURI()': 'Invalid logo URI.',
  'InvalidMasterAddress()': 'Invalid master address.',
  'InvalidMigrationIndex()': 'Invalid migration index.',
  'InvalidMode()': 'Invalid mode.',
  'InvalidMultisigOwner()': 'Invalid owner.',
  'InvalidNonceKey()': 'Invalid nonce key.',
  'InvalidOwner()': 'Invalid owner.',
  'InvalidOwnerOrder()': 'Invalid owner order.',
  'InvalidPayee()': 'Invalid payee.',
  'InvalidPayload()': 'Invalid payload.',
  'InvalidPolicyType()': 'Invalid policy type.',
  'InvalidProof()': 'Invalid proof.',
  'InvalidProofOfPossession()': 'Invalid proof of possession.',
  'InvalidPublicKey()': 'Invalid public key.',
  'InvalidQuorumCertificate()': 'Invalid quorum certificate.',
  'InvalidQuoteToken()': 'Invalid quote token.',
  'InvalidReceipt()': 'Invalid receipt.',
  'InvalidReceivePolicyType()': 'Invalid receive policy type.',
  'InvalidRecipient()': 'Invalid recipient.',
  'InvalidRecoveryAuthority()': 'Invalid recovery authority.',
  'InvalidSequencerSet()': 'Invalid sequencer set.',
  'InvalidSignature()': 'Invalid signature.',
  'InvalidSignatureFormat()': 'Invalid signature format.',
  'InvalidSignatureType()': 'Invalid signature type.',
  'InvalidSpendingLimit()': 'Invalid spending limit.',
  'InvalidSupplyCap()': 'Invalid supply cap.',
  'InvalidSwapCalculation()': 'Invalid swap calculation.',
  'InvalidTempoBlockNumber()': 'Invalid Tempo block number.',
  'InvalidThreshold()': 'Invalid threshold.',
  'InvalidTick()': 'The price tick is invalid.',
  'InvalidToken()': 'This token is not supported on the exchange.',
  'InvalidTokenEnablementTransition()': 'Invalid token enablement transition.',
  'InvalidTransferPolicyId()': 'Invalid transfer policy.',
  'InvalidValidatorAddress()': 'Invalid validator address.',
  'InvalidWeight()': 'Invalid weight.',
  'KeyAlreadyExists()': 'Key already exists.',
  'KeyAlreadyRevoked()': 'Key has already been revoked.',
  'KeyAuthorizationWitnessAlreadyBurned()':
    'Key authorization witness has already been burned.',
  'KeyExpired()': 'Key has expired.',
  'KeyNotFound()': 'Key not found.',
  'LeaderAlreadyUpdatedThisBlock()':
    'The leader has already been updated in this block.',
  'LegacyAuthorizeKeySelectorChanged(bytes4)':
    'Legacy authorize key selector changed to {0}.',
  'LogoURITooLong()': 'Logo URI is too long.',
  'MasterIdCollision(address)': 'Master ID collision with {0}.',
  'MaxInputExceeded()':
    'The required input exceeds the slippage maximum — try increasing slippage tolerance.',
  'MigrationNotComplete()': 'Migration is not complete.',
  'MustDelegateCall()': 'A delegate call is required.',
  'NoEncryptionKeyAtBlock(uint64)': 'No encryption key exists at block {0}.',
  'NoEncryptionKeySet()': 'No encryption key is set.',
  'NoOptedInSupply()': 'No opted-in supply.',
  'NonceOverflow()': 'Nonce overflow.',
  'NotAdmin()': 'The caller is not the administrator.',
  'NotFactory()': 'The caller is not the factory.',
  'NotHostPort(string,string,string)':
    '"{1}" is not a valid host:port for {0}.',
  'NotInitialized()': 'Not initialized.',
  'NotIp(string,string)': '"{0}" is not a valid IP address.',
  'NotIpPort(string,string)': '"{0}" is not a valid IP:port.',
  'NotIpPort(string,string,string)': '"{1}" is not a valid IP:port for {0}.',
  'NotOwner()': 'The caller is not an owner.',
  'NotPauseAuthority()': 'The caller is not the pause authority.',
  'NotPayeeOrOperator()': 'Not payee or operator.',
  'NotPayer()': 'Not payer.',
  'NotPendingAdmin()': 'The caller is not the pending administrator.',
  'NotSelf()': 'The caller must be the contract itself.',
  'NotSequencer()': 'The caller is not a sequencer.',
  'OnlyDirectCall()': 'A direct call is required.',
  'OrderDoesNotExist()': 'No order exists with the given ID.',
  'OrderNotStale()': 'This order is not yet eligible for stale-cleanup.',
  'PairAlreadyExists()':
    'A trading pair for these tokens has already been created.',
  'PairDoesNotExist()': 'No trading pair exists for these tokens.',
  'PermitExpired()': 'Permit has expired.',
  'PolicyForbids()': 'Forbidden by policy.',
  'PolicyNotFound()': 'Policy not found.',
  'PolicyNotSimple()': 'Policy is not a simple policy.',
  'PortalIsPaused()': 'The portal is paused.',
  'ProofOfWorkFailed()': 'Proof of work failed.',
  'ProtectedAddress()': 'Address is protected.',
  'ProtocolNonceNotSupported()': 'Protocol nonce is not supported.',
  'PublicKeyAlreadyExists()': 'Public key already exists.',
  'ReentrantWithdrawal()': 'Reentrant withdrawals are not allowed.',
  'SequencerConfigurationUnchanged()':
    'The sequencer configuration is unchanged.',
  'SignatureTypeMismatch(uint8,uint8)':
    'Signature type mismatch. Expected {0}, got {1}.',
  'SpendingLimitExceeded()': 'Spending limit exceeded.',
  'StaleLeadershipEpoch(uint64,uint64)':
    'Stale leadership epoch. Expected {0}, got {1}.',
  'SupplyCapExceeded()': 'Supply cap exceeded.',
  'TickOutOfBounds(int16)': 'Price tick {0} is outside the allowed range.',
  'TokenAlreadyEnabled()': 'The token is already enabled.',
  'TokenAlreadyExists(address)': 'Token {0} already exists.',
  'TokenEnablementBlockCapacityExceeded(uint64)':
    'The token enablement capacity per block exceeds the maximum ({0}).',
  'TokenEnablementCursorNotInitialized()':
    'The token enablement cursor is not initialized.',
  'TokenMetadataTooLong()': 'Token metadata is too long.',
  'TokenNotEnabled()': 'The token is not enabled.',
  'TokenTransferPolicyNotSet()': 'The token transfer policy is not set.',
  'TooManyOwners()': 'There are too many owners.',
  'TransferFailed()': 'The transfer failed.',
  'Unauthorized()': 'Unauthorized.',
  'UnauthorizedCaller()': 'Unauthorized caller.',
  'UnauthorizedClaimer()': 'Unauthorized claimer.',
  'UnauthorizedMultisigCaller()': 'Unauthorized multisig caller.',
  'Uninitialized()': 'Uninitialized.',
  'ValidatorAlreadyDeactivated()': 'Validator is already deactivated.',
  'ValidatorAlreadyExists()': 'Validator already exists.',
  'ValidatorNotFound()': 'Validator not found.',
  'VirtualAddressNotAllowed()': 'Virtual address is not allowed.',
  'VirtualAddressUnregistered()': 'Virtual address is not registered.',
  'ZeroDeposit()': 'Deposit cannot be zero.',
  'ZeroPublicKey()': 'Public key cannot be zero.',
}

/** Interpolate `{0}`, `{1}`, … placeholders with args. */
function interpolate(template: string, args?: readonly unknown[]): string {
  if (!args) return template
  return template.replace(/\{(\d+)\}/g, (_, i) => {
    const v = args[Number(i)]
    return v === undefined ? `{${i}}` : String(v)
  })
}

/**
 * Decorates a copy of an error with decoded Tempo execution details.
 *
 * Preserves the input's prototype, stack, cause, and custom properties.
 * Hex input can be a selector or full revert data. Without arguments,
 * message placeholders remain uninterpolated.
 *
 * @example
 * ```ts
 * import { ExecutionError } from 'viem/tempo'
 *
 * const error = ExecutionError.from('0x82b42900')
 * error.message
 * // @log: 'Unauthorized.'
 * ```
 *
 * @param error - Error instance, plain error object, selector, or revert data.
 * @returns A decorated copy, leaving the original input unchanged.
 */
export function from<error extends from.Parameters>(
  error: error,
): from.ReturnType<error>
export function from(error: from.Parameters): from.ReturnType {
  const source =
    typeof error === 'string'
      ? { data: error, message: 'Unknown execution error.' }
      : error
  const decoded = parse(source)
  const descriptors: PropertyDescriptorMap =
    Object.getOwnPropertyDescriptors(source)

  // Native stack accessors depend on the original error's internal state.
  if ('stack' in source)
    descriptors.stack = {
      configurable: descriptors.stack?.configurable ?? true,
      enumerable: descriptors.stack?.enumerable ?? false,
      value: source.stack,
      writable: descriptors.stack?.writable ?? true,
    }

  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(decoded),
  ))
    descriptors[key] = {
      ...descriptor,
      enumerable: descriptors[key]?.enumerable ?? true,
    }

  return Object.create(Object.getPrototypeOf(source), descriptors)
}

export declare namespace from {
  /** Error instance, plain error object, or ABI-encoded selector or revert data. */
  export type Parameters =
    | Error
    | Hex
    | {
        /** ABI-encoded revert data. */
        data?: Hex | { data: Hex } | undefined
        /** Fallback message when revert data cannot be decoded. */
        message: string
      }

  /** Original properties with decoded execution fields taking precedence. */
  export type ReturnType<
    error extends Parameters = Parameters,
    result extends ExecutionError = ExecutionError,
  > = result extends ExecutionError
    ? Omit<error extends Hex ? { data: error } : error, keyof result> & result
    : never
}

/**
 * Selects execution metadata for JSON serialization.
 *
 * Omits decoded arguments and original error properties, including the stack and cause.
 *
 * @example
 * ```ts
 * import { ExecutionError } from 'viem/tempo'
 *
 * const error = ExecutionError.from(new Error('execution reverted: failed'))
 * const rpc = ExecutionError.serialize(error)
 * // { errorName: 'unknown', message: 'failed' }
 * ```
 *
 * @param preimage - Decorated execution error.
 * @returns Execution error without decoded arguments.
 */
export function serialize(preimage: ExecutionError): Rpc {
  if (preimage.errorName === 'unknown')
    return { errorName: 'unknown', message: preimage.message }
  return {
    errorName: preimage.errorName,
    abiItem: preimage.abiItem,
    message: preimage.message,
    data: preimage.data,
  } as never
}

function extractRevertData(
  error: unknown,
  seen = new Set<unknown>(),
): Hex | null {
  if (!error || typeof error !== 'object' || seen.has(error)) return null
  seen.add(error)
  const e = error as Record<string, unknown>
  if (typeof e.data === 'string' && /^0x(?:[\da-f]{2})*$/i.test(e.data))
    return e.data as Hex
  for (const inner of [e.data, e.cause, e.error]) {
    const data = extractRevertData(inner, seen)
    if (data) return data
  }
  if (typeof e.walk === 'function') {
    const inner = (
      e as { walk: (fn: (e: unknown) => boolean) => unknown }
    ).walk((e) => typeof (e as Record<string, unknown>).data === 'string')
    if (inner) return extractRevertData(inner, seen)
  }
  return null
}

function parse(error: Exclude<from.Parameters, Hex>): ExecutionError {
  const raw =
    (error as { details?: string }).details ??
    (error as { shortMessage?: string }).shortMessage ??
    error.message

  const data = extractRevertData(error)
  if (data) {
    try {
      const decoded = decodeErrorResult({ abi: Abis.core, data })
      const template =
        messages[formatAbiItem(decoded.abiItem) as keyof typeof messages]
      return {
        ...decoded,
        data,
        message: template
          ? interpolate(template, decoded.args as readonly unknown[])
          : raw.replace(/^execution reverted:\s*/i, ''),
      } as never
    } catch {
      if (data.length === 10) {
        const abiItem = Abis.core.find(
          (item) =>
            item.type === 'error' &&
            toFunctionSelector(formatAbiItem(item)) === data.toLowerCase(),
        )
        if (abiItem?.type === 'error')
          return {
            abiItem,
            args: undefined,
            data,
            errorName: abiItem.name,
            message: messages[formatAbiItem(abiItem) as keyof typeof messages]!,
          } as DecodedError
      }
    }
  }

  // Human-readable names cannot distinguish overloads with different templates.
  const nameMatch = /:\s*(\w+)\(([^)]*)\)/.exec(raw)
  if (nameMatch) {
    const templates = Object.entries(messages).filter(([signature]) =>
      signature.startsWith(`${nameMatch[1]}(`),
    )
    const template =
      nameMatch[2] === ''
        ? messages[`${nameMatch[1]}()` as keyof typeof messages]
        : templates.length === 1
          ? templates[0]?.[1]
          : undefined
    if (template) return { errorName: 'unknown', message: template }
  }

  return {
    errorName: 'unknown',
    message: raw.replace(/^execution reverted:\s*/i, ''),
  }
}
