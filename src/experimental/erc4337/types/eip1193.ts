import type { Address } from 'abitype'
import type { Hash, Hex } from '../../../types/misc.js'
import type { RpcStateOverride } from '../../../types/rpc.js'
import type {
  RpcEstimateUserOperationGasReturnType,
  RpcGetUserOperationByHashReturnType,
  RpcUserOperation,
  RpcUserOperationReceipt,
} from './rpc.js'

export type BundlerRpcSchema = [
  /**
   * @description Returns the chain ID associated with the current network
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_chainid
   */
  {
    Method: 'eth_chainId'
    Parameters?: undefined
    ReturnType: Hex
  },
  /**
   * @description Estimate the gas values for a UserOperation.
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas
   *
   * @example
   * provider.request({
   *  method: 'eth_estimateUserOperationGas',
   *  params: [{ ... }]
   * })
   * // => { ... }
   */
  {
    Method: 'eth_estimateUserOperationGas'
    Parameters:
      | [userOperation: RpcUserOperation, entrypoint: Address]
      | [
          userOperation: RpcUserOperation,
          entrypoint: Address,
          stateOverrideSet: RpcStateOverride,
        ]
    ReturnType: RpcEstimateUserOperationGasReturnType
  },
  /**
   * @description Return a UserOperation based on a hash.
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_getuseroperationbyhash
   *
   * @example
   * provider.request({
   *  method: 'eth_getUserOperationByHash',
   *  params: ['0x...']
   * })
   * // => { ... }
   */
  {
    Method: 'eth_getUserOperationByHash'
    Parameters: [hash: Hash]
    ReturnType: RpcGetUserOperationByHashReturnType | null
  },
  /**
   * @description Return a UserOperation receipt based on a hash.
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_getuseroperationreceipt
   *
   * @example
   * provider.request({
   *  method: 'eth_getUserOperationReceipt',
   *  params: ['0x...']
   * })
   * // => { ... }
   */
  {
    Method: 'eth_getUserOperationReceipt'
    Parameters: [hash: Hash]
    ReturnType: RpcUserOperationReceipt | null
  },
  /**
   * @description Submits a User Operation object to the User Operation pool of the client.
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_senduseroperation
   *
   * @example
   * provider.request({
   *  method: 'eth_sendUserOperation',
   *  params: [{ ... }]
   * })
   * // => '0x...'
   */
  {
    Method: 'eth_sendUserOperation'
    Parameters: [userOperation: RpcUserOperation, entrypoint: Address]
    ReturnType: Hash
  },
  /**
   * @description Return the list of supported entry points by the client.
   *
   * @link https://eips.ethereum.org/EIPS/eip-4337#-eth_supportedentrypoints
   */
  {
    Method: 'eth_supportedEntryPoints'
    Parameters?: undefined
    ReturnType: readonly Address[]
  },
]
