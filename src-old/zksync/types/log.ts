import type { Abi, AbiEvent } from 'abitype'
import type { Log as Log_ } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { RpcLog as RpcLog_ } from '../../types/rpc.js'

export type ZksyncLog<
  quantity = bigint,
  index = number,
  pending extends boolean = boolean,
  abiEvent extends AbiEvent | undefined = undefined,
  strict extends boolean | undefined = undefined,
  abi extends Abi | readonly unknown[] | undefined = abiEvent extends AbiEvent
    ? [abiEvent]
    : undefined,
  eventName extends string | undefined = abiEvent extends AbiEvent
    ? abiEvent['name']
    : undefined,
> = Log_<quantity, index, pending, abiEvent, strict, abi, eventName> & {
  l1BatchNumber: quantity | null
  transactionLogIndex: index
  logType: Hex | null
}

export type ZksyncRpcLog = RpcLog_ & {
  l1BatchNumber: Hex | null
  // These are returned but doesn't appear in Log structure neither is mentioned in https://era.zksync.io/docs/api/js/types
  transactionLogIndex: Hex
  logType: Hex | null
}

export type ZksyncL2ToL1Log = {
  blockNumber: bigint
  blockHash: string
  l1BatchNumber: bigint
  transactionIndex: bigint
  shardId: bigint
  isService: boolean
  sender: string
  key: string
  value: string
  transactionHash: string
  logIndex: bigint
}

export type ZksyncRpcL2ToL1Log = {
  blockNumber: Hex
  blockHash: Hex
  l1BatchNumber: Hex | null
  transactionIndex: Hex
  shardId: Hex
  isService: boolean
  sender: Hex
  key: Hex
  value: Hex
  transactionHash: Hex
  logIndex: Hex
}
