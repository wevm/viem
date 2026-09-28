import type { Hex } from '../../../types/misc.js'
import type { OneOf, UnionOmit } from '../../../types/utils.js'
import {
  type DecodeErrorResultReturnType,
  decodeErrorResult,
} from '../../../utils/abi/decodeErrorResult.js'
import * as Abis from '../../Abis.js'

type AllAbis = typeof Abis.core
type AbiErrorName = Extract<AllAbis[number], { type: 'error' }>['name']

/** Decoded execution error from a Tempo precompile revert. */
export type ExecutionError = OneOf<
  | (DecodeErrorResultReturnType<AllAbis> & {
      data: Hex
      message: string
    })
  | { errorName: 'unknown'; message: string }
>

/** RPC-serialized execution error (bigints and numbers as hex). */
export type Rpc = UnionOmit<ExecutionError, 'args'>

/** Human-readable messages keyed by ABI error name. */
export const messages: Partial<Record<AbiErrorName, string>> = {
  AddressAlreadyHasValidator: 'This address already has a validator.',
  AddressNotReserved: 'Address is not reserved.',
  AddressReserved: 'Address is reserved.',
  AlreadyInitialized: 'Already initialized.',
  AmountExceedsDeposit: 'Amount exceeds deposit.',
  AmountNotIncreasing: 'Amount is not increasing.',
  BelowMinimumOrderSize: 'Order size is below the minimum allowed ({0}).',
  CallNotAllowed: 'This call is not allowed.',
  CannotChangeWithinBlock: 'Cannot change within the same block.',
  CaptureAmountInvalid: 'Capture amount is invalid.',
  ChannelAlreadyExists: 'Channel already exists.',
  ChannelNotFound: 'Channel not found.',
  CloseNotReady: 'Channel is not ready to close.',
  ContractPaused: 'Contract is paused.',
  DepositOverflow: 'Deposit overflow.',
  DivisionByZero: 'Division by zero.',
  EmptyV1ValidatorSet: 'Validator set is empty.',
  ExpiringNonceHashNotSet: 'Expiring nonce hash is not set.',
  ExpiringNonceReplay: 'Expiring nonce has already been used.',
  ExpiringNonceSetFull: 'Expiring nonce set is full.',
  ExpiryInPast: 'Expiry is in the past.',
  IdenticalAddresses: 'Addresses must be different.',
  IdenticalTokens:
    'Cannot swap a token for itself — input and output tokens must be different.',
  IncompatiblePolicyType: 'Incompatible policy type.',
  IngressAlreadyExists: 'Ingress "{0}" already exists.',
  InsufficientAllowance: 'Insufficient allowance.',
  InsufficientBalance: 'Insufficient balance. Required: {1}, available: {0}.',
  InsufficientFeeTokenBalance: 'Insufficient fee token balance.',
  InsufficientLiquidity:
    'Not enough liquidity in the order book to fill this trade.',
  InsufficientOutput:
    'The output amount is below the slippage minimum — try increasing slippage tolerance.',
  InsufficientReserves: 'Insufficient reserves.',
  InvalidAmount: 'Invalid amount.',
  InvalidBaseToken:
    'This token is not a valid base token for the requested pair.',
  InvalidCallScope: 'Invalid call scope.',
  InvalidClaimAddress: 'Invalid claim address.',
  InvalidCurrency: 'Invalid currency.',
  InvalidExpiringNonceExpiry: 'Invalid expiring nonce expiry.',
  InvalidFlipTick: 'The flip-order price tick is invalid.',
  InvalidFormat: 'Invalid format.',
  InvalidKeyAuthorizationWitness: 'Invalid key authorization witness.',
  InvalidKeyId: 'Invalid key ID.',
  InvalidLogoURI: 'Invalid logo URI.',
  InvalidMasterAddress: 'Invalid master address.',
  InvalidMigrationIndex: 'Invalid migration index.',
  InvalidMode: 'Invalid mode.',
  InvalidNonceKey: 'Invalid nonce key.',
  InvalidOwner: 'Invalid owner.',
  InvalidPayee: 'Invalid payee.',
  InvalidPayload: 'Invalid payload.',
  InvalidPolicyType: 'Invalid policy type.',
  InvalidPublicKey: 'Invalid public key.',
  InvalidQuoteToken: 'Invalid quote token.',
  InvalidReceipt: 'Invalid receipt.',
  InvalidReceivePolicyType: 'Invalid receive policy type.',
  InvalidRecipient: 'Invalid recipient.',
  InvalidRecoveryAuthority: 'Invalid recovery authority.',
  InvalidSignature: 'Invalid signature.',
  InvalidSignatureFormat: 'Invalid signature format.',
  InvalidSignatureType: 'Invalid signature type.',
  InvalidSpendingLimit: 'Invalid spending limit.',
  InvalidSupplyCap: 'Invalid supply cap.',
  InvalidSwapCalculation: 'Invalid swap calculation.',
  InvalidTick: 'The price tick is invalid.',
  InvalidToken: 'This token is not supported on the exchange.',
  InvalidTransferPolicyId: 'Invalid transfer policy.',
  InvalidValidatorAddress: 'Invalid validator address.',
  KeyAlreadyExists: 'Key already exists.',
  KeyAlreadyRevoked: 'Key has already been revoked.',
  KeyAuthorizationWitnessAlreadyBurned:
    'Key authorization witness has already been burned.',
  KeyExpired: 'Key has expired.',
  KeyNotFound: 'Key not found.',
  LegacyAuthorizeKeySelectorChanged:
    'Legacy authorize key selector changed to {0}.',
  LogoURITooLong: 'Logo URI is too long.',
  MasterIdCollision: 'Master ID collision with {0}.',
  MaxInputExceeded:
    'The required input exceeds the slippage maximum — try increasing slippage tolerance.',
  MigrationNotComplete: 'Migration is not complete.',
  NoOptedInSupply: 'No opted-in supply.',
  NonceOverflow: 'Nonce overflow.',
  NotHostPort: '"{1}" is not a valid host:port for {0}.',
  NotInitialized: 'Not initialized.',
  NotIp: '"{0}" is not a valid IP address.',
  NotIpPort: '"{1}" is not a valid IP:port for {0}.',
  NotPayeeOrOperator: 'Not payee or operator.',
  NotPayer: 'Not payer.',
  OrderDoesNotExist: 'No order exists with the given ID.',
  OrderNotStale: 'This order is not yet eligible for stale-cleanup.',
  PairAlreadyExists:
    'A trading pair for these tokens has already been created.',
  PairDoesNotExist: 'No trading pair exists for these tokens.',
  PermitExpired: 'Permit has expired.',
  PolicyForbids: 'Forbidden by policy.',
  PolicyNotFound: 'Policy not found.',
  PolicyNotSimple: 'Policy is not a simple policy.',
  ProofOfWorkFailed: 'Proof of work failed.',
  ProtectedAddress: 'Address is protected.',
  ProtocolNonceNotSupported: 'Protocol nonce is not supported.',
  PublicKeyAlreadyExists: 'Public key already exists.',
  SignatureTypeMismatch: 'Signature type mismatch. Expected {0}, got {1}.',
  SpendingLimitExceeded: 'Spending limit exceeded.',
  SupplyCapExceeded: 'Supply cap exceeded.',
  TickOutOfBounds: 'Price tick {0} is outside the allowed range.',
  TokenAlreadyExists: 'Token {0} already exists.',
  Unauthorized: 'Unauthorized.',
  UnauthorizedCaller: 'Unauthorized caller.',
  UnauthorizedClaimer: 'Unauthorized claimer.',
  Uninitialized: 'Uninitialized.',
  ValidatorAlreadyDeactivated: 'Validator is already deactivated.',
  ValidatorAlreadyExists: 'Validator already exists.',
  ValidatorNotFound: 'Validator not found.',
  VirtualAddressNotAllowed: 'Virtual address is not allowed.',
  VirtualAddressUnregistered: 'Virtual address is not registered.',
  ZeroDeposit: 'Deposit cannot be zero.',
  ZeroPublicKey: 'Public key cannot be zero.',
}

/** Interpolate `{0}`, `{1}`, … placeholders with args. */
function interpolate(template: string, args?: readonly unknown[]): string {
  if (!args) return template
  return template.replace(/\{(\d+)\}/g, (_, i) => {
    const v = args[Number(i)]
    return v === undefined ? `{${i}}` : String(v)
  })
}

/** Parse a viem error into a structured execution error. */
export function parse(error: Error): ExecutionError {
  const raw =
    (error as { details?: string }).details ??
    (error as { shortMessage?: string }).shortMessage ??
    error.message

  const data = extractRevertData(error)
  if (data) {
    try {
      const decoded = decodeErrorResult({ abi: Abis.core, data })
      const template = messages[decoded.errorName as AbiErrorName]
      return {
        ...decoded,
        data,
        message: template
          ? interpolate(template, decoded.args as readonly unknown[])
          : raw.replace(/^execution reverted:\s*/i, ''),
      } as never
    } catch {}
  }

  // Fallback: extract error name from human-readable revert message.
  const nameMatch = /:\s*(\w+)\(\w+/.exec(raw)
  const errorName = nameMatch?.[1]
  if (errorName && errorName in messages)
    return {
      errorName: 'unknown',
      message: messages[errorName as AbiErrorName]!,
    }

  return {
    errorName: 'unknown',
    message: raw.replace(/^execution reverted:\s*/i, ''),
  }
}

/** Serializes an ExecutionError for RPC transport (bigints/numbers → hex). */
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

function extractRevertData(error: unknown): Hex | null {
  if (!error || typeof error !== 'object') return null
  const e = error as Record<string, unknown>
  if (typeof e.data === 'string' && e.data.startsWith('0x'))
    return e.data as Hex
  if (e.cause) return extractRevertData(e.cause)
  if (e.error) return extractRevertData(e.error)
  if (typeof e.walk === 'function') {
    const inner = (
      e as { walk: (fn: (e: unknown) => boolean) => unknown }
    ).walk((e) => typeof (e as Record<string, unknown>).data === 'string')
    if (inner) return extractRevertData(inner)
  }
  return null
}
