import type { Address } from 'abitype'
import type { SiweMessage } from '../utils/siwe/types.js'
import type { Hex } from './misc.js'
import type { ResolvedRegister } from './register.js'
import type { OneOf, Prettify, RequiredBy } from './utils.js'

export type CapabilitiesSchema = ResolvedRegister['CapabilitiesSchema']

export type DefaultCapabilitiesSchema = {
  connect: {
    Request: {
      unstable_addSubAccount?:
        | {
            account: OneOf<
              | {
                  address: Address
                  chainId?: number | undefined
                  type: 'deployed'
                }
              | {
                  keys: readonly {
                    key: Hex
                    type:
                      | 'address'
                      | 'p256'
                      | 'webcrypto-p256'
                      | 'webauthn-p256'
                  }[]
                  type: 'create'
                }
              | {
                  address: Address
                  chainId?: number | undefined
                  factory: Address
                  factoryData: Hex
                  type: 'undeployed'
                }
            >
          }
        | undefined
      unstable_getSubAccounts?: boolean | undefined
      unstable_signInWithEthereum?:
        | RequiredBy<Partial<SiweMessage>, 'chainId' | 'nonce'>
        | undefined
    }
    ReturnType: {
      unstable_addSubAccount?:
        | {
            address: Address
          }
        | undefined
      unstable_getSubAccounts?:
        | readonly {
            address: Address
            factory?: Address | undefined
            factoryData?: Hex | undefined
          }[]
        | undefined
      unstable_signInWithEthereum?:
        | {
            message: string
            signature: Hex
          }
        | undefined
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
            [chainId: number]: {
              url: string
              context?: Record<string, any> | undefined
            }
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
