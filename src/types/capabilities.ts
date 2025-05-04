import type { Hex } from './misc.js'
import type { Prettify } from './utils.js'

export type CapabilitiesSchema = {
  getCapabilities: {
    ReturnType: {
      atomic?:
        | {
            status: 'supported' | 'ready' | 'unsupported'
          }
        | undefined
      experimental_paymasterService?:
        | {
            supported: boolean
          }
        | undefined
    }
  }
  sendCalls: {
    Request: {
      experimental_paymasterService?:
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
