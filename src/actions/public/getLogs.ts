import type { AbiEvent, Address, Narrow } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
} from '../../errors/abi.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hash, LogTopic } from '../../types/misc.js'
import type { RpcLog } from '../../types/rpc.js'
import { decodeEventLog } from '../../utils/abi/decodeEventLog.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../utils/abi/encodeEventTopics.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { formatLog } from '../../utils/formatters/log.js'

export type GetLogsParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  /** Address or list of addresses from which logs originated */
  address?: Address | Address[]
} & (
  | {
      event: Narrow<TAbiEvent>
      args?: MaybeExtractEventArgsFromAbi<[TAbiEvent], _EventName>
      /**
       * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
       * @default false
       */
      strict?: TStrict
    }
  | {
      event?: never
      args?: never
      strict?: never
    }
) &
  (
    | {
        /** Block number or tag after which to include logs */
        fromBlock?: BlockNumber<bigint> | BlockTag
        /** Block number or tag before which to include logs */
        toBlock?: BlockNumber<bigint> | BlockTag
        blockHash?: never
      }
    | {
        fromBlock?: never
        toBlock?: never
        /** Hash of block to include logs from */
        blockHash?: Hash
      }
  )

export type GetLogsReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, TAbiEvent, TStrict, [TAbiEvent], _EventName>[]

/**
 * Returns a list of event logs matching the provided parameters.
 *
 * - Docs: https://viem.sh/docs/actions/public/getLogs.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * @param client - Client to use
 * @param parameters - {@link GetLogsParameters}
 * @returns A list of event logs. {@link GetLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getLogs } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await getLogs(client)
 */
export async function getLogs<
  TChain extends Chain | undefined,
  TAbiEvent extends AbiEvent | undefined,
  TStrict extends boolean | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    args,
    strict: strict_,
  }: GetLogsParameters<TAbiEvent, TStrict> = {},
): Promise<GetLogsReturnType<TAbiEvent, TStrict>> {
  const strict = strict_ ?? false

  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: (event as AbiEvent).name,
      args,
    } as EncodeEventTopicsParameters)

  let logs: RpcLog[]
  if (blockHash) {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [{ address, topics, blockHash }],
    })
  } else {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [
        {
          address,
          topics,
          fromBlock:
            typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        },
      ],
    })
  }

  return logs
    .map((log) => {
      try {
        const { eventName, args } = event
          ? decodeEventLog({
              abi: [event] as [AbiEvent],
              data: log.data,
              topics: log.topics as any,
              strict,
            })
          : { eventName: undefined, args: undefined }
        return formatLog(log, { args, eventName })
      } catch (err) {
        let eventName
        let isUnnamed
        if (
          err instanceof DecodeLogDataMismatch ||
          err instanceof DecodeLogTopicsMismatch
        ) {
          // If strict mode is on, and log data/topics do not match event definition, skip.
          if (strict) return
          eventName = err.abiItem.name
          isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name))
        }

        // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
        return formatLog(log, { args: isUnnamed ? [] : {}, eventName })
      }
    })
    .filter(Boolean) as unknown as GetLogsReturnType<TAbiEvent, TStrict>
}
