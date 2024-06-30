import type { Abi, AbiEvent } from 'abitype'
import type { Log as Log_ } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { RpcLog as RpcLog_ } from '../../types/rpc.js'

export type ZkSyncLog<
  TQuantity = bigint,
  TIndex = number,
  TPending extends boolean = boolean,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  TAbi extends Abi | readonly unknown[] | undefined = TAbiEvent extends AbiEvent
    ? [TAbiEvent]
    : undefined,
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
> = Log_<TQuantity, TIndex, TPending, TAbiEvent, TStrict, TAbi, TEventName> & {
  l1BatchNumber: TQuantity | null
  transactionLogIndex: TIndex
  logType: Hex | null
}

export type ZkSyncRpcLog = RpcLog_ & {
  l1BatchNumber: Hex | null
  // These are returned but doesn't appear in Log structure neither is mentioned in https://era.zksync.io/docs/api/js/types
  transactionLogIndex: Hex
  logType: Hex | null
}

export type ZkSyncL2ToL1Log = {
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

export type ZkSyncRpcL2ToL1Log = {
  blockNumber: Hex
  blockHash: Hex
  l1BatchNumber: Hex
  transactionIndex: Hex
  shardId: Hex
  isService: boolean
  sender: Hex
  key: Hex
  value: Hex
  transactionHash: Hex
  logIndex: Hex
}
