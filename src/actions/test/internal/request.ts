import type * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'

import type * as Client from '../../../core/Client.js'
import type * as Transport from '../../../core/Transport.js'

export type Schema = RpcSchema.From<
  | {
      Request: {
        method: 'anvil_mine'
        params: [blocks: Hex.Hex, interval: Hex.Hex]
      }
      ReturnType: void
    }
  | {
      Request: {
        method: 'anvil_setBalance'
        params: [address: Address.Address, value: Hex.Hex]
      }
      ReturnType: void
    }
  | {
      Request: {
        method: 'anvil_setCode'
        params: [address: Address.Address, bytecode: Hex.Hex]
      }
      ReturnType: void
    }
  | {
      Request: {
        method: 'anvil_setNonce'
        params: [address: Address.Address, nonce: Hex.Hex]
      }
      ReturnType: void
    }
  | {
      Request: {
        method: 'anvil_setStorageAt'
        params: [address: Address.Address, index: Hex.Hex, value: Hex.Hex]
      }
      ReturnType: void
    }
  | {
      Request: {
        method: 'evm_revert'
        params: [id: Hex.Hex]
      }
      ReturnType: boolean
    }
  | {
      Request: {
        method: 'evm_snapshot'
        params?: undefined
      }
      ReturnType: Hex.Hex
    }
>

export function request<methodName extends RpcSchema.ExtractMethodName<Schema>>(
  client: Client.Client,
  options: Transport.Request<Schema, methodName>,
): Promise<RpcSchema.ExtractReturnType<Schema, methodName>> {
  return client.request(options as never) as never
}
