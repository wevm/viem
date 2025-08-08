import type {
  AddSubAccountParameters,
  AddSubAccountReturnType,
} from '../experimental/erc7895/actions/addSubAccount.js'
import type { SiweMessage } from '../utils/siwe/types.js'
import type { Hex } from './misc.js'
import type { ResolvedRegister } from './register.js'
import type { Prettify, RequiredBy } from './utils.js'

export type CapabilitiesSchema = ResolvedRegister['CapabilitiesSchema']

export type DefaultCapabilitiesSchema = {
  connect: {
    Request: {
      unstable_addSubAccount?:
        | {
            account: AddSubAccountParameters
          }
        | undefined
      unstable_signInWithEthereum?:
        | RequiredBy<Partial<SiweMessage>, 'chainId' | 'nonce'>
        | undefined
    }
    ReturnType: {
      unstable_signInWithEthereum?:
        | {
            message: string
            signature: Hex
          }
        | undefined
      unstable_subAccounts?: readonly AddSubAccountReturnType[] | undefined
    }
  }
  getCapabilities: {
    ReturnType: {
      atomic?:
        | {
            status: 'supported' | 'ready' | 'unsupported'
          }
        | undefined
      unstable_addSubAccount?:
        | {
            keyTypes: (
              | 'address'
              | 'p256'
              | 'webcrypto-p256'
              | 'webauthn-p256'
            )[]
            supported: boolean
          }
        | undefined
      paymasterService?:
        | {
            supported: boolean
          }
        | undefined
    }
  }
  sendCalls: {
    Request: {
      paymasterService?:
        | {
            context?: Record<string, any> | undefined
            optional?: boolean | undefined
            url: string
          }
        | undefined
    }
  }
}

export type Capabilities<capabilities extends Record<string, any> = {}> = {
  [key: string]: any
} & capabilities

export type ChainIdToCapabilities<
  capabilities extends Capabilities = Capabilities,
  id extends string | number = Hex,
> = {
  [chainId in id]: capabilities
}

export type ExtractCapabilities<
  method extends string,
  key extends 'Request' | 'ReturnType',
> = Prettify<
  method extends keyof CapabilitiesSchema
    ? CapabilitiesSchema[method] extends {
        [k in key]: infer value extends Record<string, any>
      }
      ? Capabilities<value>
      : Capabilities
    : Capabilities
>
