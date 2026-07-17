import type { Abi, AbiStateMutability } from 'abitype'
import type { AbiEvent, AbiFunction, Address, Block } from 'ox'

import type * as Client from './Client.js'
import { createEventFilter as createEventFilter_ } from './actions/contract/createEventFilter.js'
import { estimateGas as estimateGas_ } from './actions/contract/estimateGas.js'
import { getLogs as getLogs_ } from './actions/contract/getLogs.js'
import { read as read_ } from './actions/contract/read.js'
import { simulate as simulate_ } from './actions/contract/simulate.js'
import { watchEvent as watchEvent_ } from './actions/contract/watchEvent.js'
import { write as write_ } from './actions/contract/write.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from './actions/internal/contract.js'
import type { Prettify } from './internal/types.js'

/** A contract bound to an ABI, address, and Client. */
export type Contract<
  abi extends Abi | readonly unknown[] = Abi,
  address extends Address.Address = Address.Address,
  client extends Client.Client = Client.Client,
> = from.ReturnType<abi, address, client>

/**
 * Creates a type-safe contract interface bound to an ABI, address, and Client.
 *
 * @example
 * ```ts
 * import { Client, Contract, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 * const contract = Contract.from({
 *   abi: Abi.from([
 *     'function balanceOf(address owner) view returns (uint256)',
 *   ]),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   client,
 * })
 *
 * const balance = await contract.read.balanceOf({
 *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 * })
 * ```
 *
 * @param options - Contract ABI, address, and Client.
 * @returns A contract interface with methods derived from the ABI.
 */
export function from<
  const abi extends Abi | readonly unknown[],
  const address extends Address.Address,
  const client extends Client.Client,
>(
  options: from.Options<abi, address, client>,
): from.ReturnType<abi, address, client> {
  const { abi, address, client } = options

  const eventNames = new Set<string>()
  const readNames = new Set<string>()
  const writeNames = new Set<string>()

  for (const item of abi) {
    if (typeof item !== 'object' || item === null) continue
    const { name, stateMutability, type } = item as RuntimeAbiItem
    if (typeof name !== 'string') continue

    if (type === 'event') eventNames.add(name)
    if (type !== 'function') continue
    if (stateMutability === 'pure' || stateMutability === 'view')
      readNames.add(name)
    else writeNames.add(name)
  }

  const contract: RuntimeContract = { abi, address }

  if (readNames.size)
    contract.read = createMethods(readNames, (functionName, options) =>
      read_(client, {
        ...options,
        abi,
        address,
        functionName,
      } as read_.Options),
    )

  if (writeNames.size) {
    contract.estimateGas = createMethods(writeNames, (functionName, options) =>
      estimateGas_(client, {
        ...options,
        abi,
        address,
        functionName,
      } as estimateGas_.Options),
    )
    contract.simulate = createMethods(writeNames, (functionName, options) =>
      simulate_(client, {
        ...options,
        abi,
        address,
        functionName,
      } as simulate_.Options),
    )
    if (client.account)
      contract.write = createMethods(writeNames, (functionName, options) =>
        write_(client, {
          ...options,
          abi,
          address,
          functionName,
        } as write_.Options),
      )
  }

  if (eventNames.size) {
    contract.createEventFilter = createMethods(
      eventNames,
      (eventName, options) =>
        createEventFilter_(client, {
          ...options,
          abi,
          address,
          eventName,
        } as createEventFilter_.Options),
    )
    contract.getLogs = createMethods(eventNames, (eventName, options) =>
      getLogs_(client, {
        ...options,
        abi,
        address,
        eventName,
      } as getLogs_.Options),
    )
    contract.watchEvent = createMethods(eventNames, (eventName, options) =>
      watchEvent_(client, {
        ...options,
        abi,
        address,
        eventName,
      } as watchEvent_.Options),
    )
  }

  return contract as from.ReturnType<abi, address, client>
}

export declare namespace from {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    address extends Address.Address = Address.Address,
    client extends Client.Client = Client.Client,
  > = {
    /** Contract ABI. */
    abi: abi
    /** Contract address. */
    address: address
    /** Client used to execute contract actions. */
    client: client
  }

  type ReturnType<
    abi extends Abi | readonly unknown[] = Abi,
    address extends Address.Address = Address.Address,
    client extends Client.Client = Client.Client,
  > = Prettify<
    {
      /** Contract ABI. */
      abi: abi
      /** Contract address. */
      address: address
    } & ReadGroup<abi> &
      WriteGroups<abi, client> &
      EventGroups<abi>
  >
}

type FunctionNames<
  abi extends Abi | readonly unknown[],
  mutability extends AbiStateMutability,
> = [Abi] extends [abi]
  ? string
  : abi extends Abi
    ? AbiFunction.ExtractNames<abi, mutability>
    : string

type EventNames<abi extends Abi | readonly unknown[]> =
  AbiEvent.extractLogs.EventName<abi>

type ReadGroup<abi extends Abi | readonly unknown[]> = [
  FunctionNames<abi, 'pure' | 'view'>,
] extends [never]
  ? {}
  : {
      /** Read-only contract methods derived from the ABI. */
      read: {
        [functionName in FunctionNames<abi, 'pure' | 'view'>]: ReadMethod<
          abi,
          functionName & ContractFunctionName<abi, 'pure' | 'view'>
        >
      }
    }

type WriteGroups<
  abi extends Abi | readonly unknown[],
  client extends Client.Client,
> = [FunctionNames<abi, 'nonpayable' | 'payable'>] extends [never]
  ? {}
  : {
      /** Gas estimators derived from the ABI's write functions. */
      estimateGas: {
        [functionName in FunctionNames<
          abi,
          'nonpayable' | 'payable'
        >]: EstimateGasMethod<
          abi,
          functionName & ContractFunctionName<abi, 'nonpayable' | 'payable'>
        >
      }
      /** Write-function simulators derived from the ABI. */
      simulate: {
        [functionName in FunctionNames<
          abi,
          'nonpayable' | 'payable'
        >]: SimulateMethod<
          abi,
          functionName & ContractFunctionName<abi, 'nonpayable' | 'payable'>
        >
      }
    } & ([client['account']] extends [undefined]
      ? {}
      : {
          /** Write methods derived from the ABI. Requires a Client with an Account. */
          write: {
            [functionName in FunctionNames<
              abi,
              'nonpayable' | 'payable'
            >]: WriteMethod<
              abi,
              functionName &
                ContractFunctionName<abi, 'nonpayable' | 'payable'>,
              client['chain']
            >
          }
        })

type EventGroups<abi extends Abi | readonly unknown[]> = [
  EventNames<abi>,
] extends [never]
  ? {}
  : {
      /** Event filter creators derived from the ABI. */
      createEventFilter: {
        [eventName in EventNames<abi>]: CreateEventFilterMethod<abi, eventName>
      }
      /** Event log readers derived from the ABI. */
      getLogs: {
        [eventName in EventNames<abi>]: GetLogsMethod<abi, eventName>
      }
      /** Event watchers derived from the ABI. */
      watchEvent: {
        [eventName in EventNames<abi>]: WatchEventMethod<abi, eventName>
      }
    }

type ReadMethod<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
> = <
  const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName> =
    ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
>(
  ...parameters: OptionsParameter<
    BindFunctionOptions<read_.Options<abi, functionName, args>>
  >
) => Promise<read_.ReturnType<abi, functionName, args>>

type EstimateGasMethod<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
> = <
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
>(
  ...parameters: OptionsParameter<
    BindFunctionOptions<estimateGas_.Options<abi, functionName, args>>
  >
) => Promise<estimateGas_.ReturnType>

type SimulateMethod<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
> = <
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
>(
  ...parameters: OptionsParameter<
    BindFunctionOptions<simulate_.Options<abi, functionName, args>>
  >
) => Promise<simulate_.ReturnType<abi, functionName, args>>

type WriteMethod<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  chain extends Client.Client['chain'],
> = <
  const args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
>(
  ...parameters: OptionsParameter<
    BindFunctionOptions<write_.Options<abi, functionName, args, chain>>
  >
) => Promise<write_.ReturnType>

type CreateEventFilterMethod<
  abi extends Abi | readonly unknown[],
  eventName extends EventNames<abi>,
> = <
  const strict extends boolean | undefined = undefined,
  const fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  const toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  options?:
    | BindEventOptions<
        createEventFilter_.Options<abi, eventName, strict, fromBlock, toBlock>
      >
    | undefined,
) => Promise<
  createEventFilter_.ReturnType<abi, eventName, strict, fromBlock, toBlock>
>

type GetLogsMethod<
  abi extends Abi | readonly unknown[],
  eventName extends EventNames<abi>,
> = <
  const strict extends boolean | undefined = undefined,
  const fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  const toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  options?:
    | BindEventOptions<
        getLogs_.Options<abi, eventName, strict, fromBlock, toBlock>
      >
    | undefined,
) => Promise<getLogs_.ReturnType<abi, eventName, strict, fromBlock, toBlock>>

type WatchEventMethod<
  abi extends Abi | readonly unknown[],
  eventName extends EventNames<abi>,
> = <
  const strict extends boolean | undefined = undefined,
  const fromBlock extends Block.Number | undefined = undefined,
>(
  options?:
    | BindEventOptions<watchEvent_.Options<abi, eventName, strict, fromBlock>>
    | undefined,
) => watchEvent_.ReturnType<abi, eventName, strict>

type BindFunctionOptions<options> = options extends object
  ? Prettify<Omit<options, 'abi' | 'address' | 'functionName'>>
  : never

type BindEventOptions<options> = options extends object
  ? Prettify<Omit<options, 'abi' | 'address' | 'eventName'>>
  : never

type OptionsParameter<options> = {} extends options
  ? [options?: options | undefined]
  : [options: options]

type RuntimeAbiItem = {
  name?: unknown
  stateMutability?: unknown
  type?: unknown
}

type RuntimeContract = {
  abi: readonly unknown[]
  address: Address.Address
} & Record<string, unknown>

type RuntimeMethod = (options?: Record<string, unknown> | undefined) => unknown

function createMethods(
  names: ReadonlySet<string>,
  fn: (name: string, options: Record<string, unknown>) => unknown,
) {
  const methods: Record<string, RuntimeMethod> = Object.create(null)
  for (const name of names) methods[name] = (options = {}) => fn(name, options)
  return methods
}
