import type { Address } from 'abitype'
import type { KeyAuthorization } from 'ox/tempo'
import type { DefaultCapabilitiesSchema } from '../types/capabilities.js'
import type { Hex } from '../types/misc.js'
import type { ExactPartial, OneOf } from '../types/utils.js'
import type { DecodeErrorResultReturnType } from '../utils/index.js'
import type { WalletAuthorizeAccessKeyParameters } from './internal/walletAccessKey.js'
import type { TransactionRequestTempo } from './Transaction.js'

export type Schema = Omit<
  DefaultCapabilitiesSchema,
  'connect' | 'sendCalls'
> & {
  connect: {
    Request: DefaultCapabilitiesSchema['connect']['Request'] &
      ConnectCapabilities
    ReturnType: DefaultCapabilitiesSchema['connect']['ReturnType'] &
      ConnectCapabilitiesReturn
  }
  fillTransaction: {
    Request: FillTransactionRequestCapabilities
    ReturnType: FillTransactionCapabilities
  }
  sendCalls: {
    Request: ExactPartial<TransactionRequestTempo>
  }
}

export type ConnectCapabilities =
  | ConnectRegisterCapabilities
  | ConnectLoginCapabilities

export type ConnectRegisterCapabilities = {
  /** Access key to authorize during connect. */
  authorizeAccessKey?: ConnectAuthorizeAccessKey | undefined
  /** Digest to sign during account creation. */
  digest?: Hex | undefined
  /** Server-auth configuration. */
  auth?: ConnectAuth | undefined
  /** Register a new account. */
  method: 'register'
  /** Account label. */
  name?: string | undefined
  /** Message to sign during connect. */
  personalSign?: ConnectPersonalSign | undefined
  /** Optional funding prompt to show after connect. */
  showDeposit?: ConnectShowDeposit | undefined
  /** User ID for account registration. */
  userId?: string | undefined
}

export type ConnectLoginCapabilities = {
  /** Access key to authorize during connect. */
  authorizeAccessKey?: ConnectAuthorizeAccessKey | undefined
  /** Credential ID to load. */
  credentialId?: string | undefined
  /** Digest to sign during login. */
  digest?: Hex | undefined
  /** Server-auth configuration. */
  auth?: ConnectAuth | undefined
  /** Login to an existing account. */
  method?: 'login' | undefined
  /** Message to sign during connect. */
  personalSign?: ConnectPersonalSign | undefined
  /** Whether to show account selection. */
  selectAccount?: boolean | undefined
  /** Optional funding prompt to show after connect. */
  showDeposit?: ConnectShowDeposit | undefined
}

export type ConnectAuthorizeAccessKey = Omit<
  WalletAuthorizeAccessKeyParameters,
  'showDeposit'
>

export type ConnectAuth =
  | string
  | {
      challenge?: string | undefined
      logout?: string | undefined
      returnToken?: boolean | undefined
      url?: string | undefined
      verify?: string | undefined
    }

export type ConnectPersonalSign = {
  message: string
}

export type ConnectShowDeposit =
  | boolean
  | {
      amount?: string | undefined
      displayName?: string | undefined
      on?: 'login' | 'register' | undefined
      token?: Address | string | undefined
    }

export type ConnectCapabilitiesReturn = {
  auth?: { token?: string | undefined } | undefined
  email?: string | null | undefined
  keyAuthorization?: KeyAuthorization.Signed | undefined
  personalSign?: ConnectPersonalSign | undefined
  signature?: Hex | undefined
  username?: string | null | undefined
}

export type FillTransactionRequestCapabilities = {
  /** Whether to include `balanceDiffs` in the response. */
  balanceDiffs?: boolean | undefined
}

export type FillTransactionCapabilities = {
  autoSwap?:
    | {
        calls: readonly { to: Address; data: Hex; value: Hex }[]
        maxIn: SwapAmount
        minOut: SwapAmount
        slippage: number
      }
    | undefined
  balanceDiffs?: Readonly<Record<Address, readonly BalanceDiff[]>> | undefined
  error?:
    | OneOf<
        | (DecodeErrorResultReturnType & {
            data: Hex
            message: string
          })
        | { errorName: 'unknown'; message: string }
      >
    | undefined
  fee?:
    | {
        amount: Hex
        decimals: number
        formatted: string
        symbol: string
      }
    | undefined
  requireFunds?:
    | {
        amount: Hex
        decimals: number
        formatted: string
        token: Address
        symbol: string
      }
    | undefined
  sponsor?:
    | {
        address: Address
        name?: string | undefined
        url?: string | undefined
      }
    | undefined
  sponsored?: boolean | undefined
  /** Virtual-address resolutions keyed by lowercase literal virtual address. */
  virtualAddresses?: Readonly<Record<Address, Address | null>> | undefined
}

export type BalanceDiff = {
  address: Address
  decimals: number
  direction: 'incoming' | 'outgoing'
  formatted: string
  name: string
  recipients: readonly Address[]
  symbol: string
  value: Hex
}

export type SwapAmount = {
  decimals: number
  formatted: string
  name: string
  symbol: string
  token: Address
  value: Hex
}
