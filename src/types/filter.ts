import type {
  EventDefinition,
  ExtractArgsFromEventDefinition,
} from './contract'
import type { Hex } from './misc'

export type EventFilterArgs<
  TEventDefinition extends EventDefinition | undefined,
> = ExtractArgsFromEventDefinition<TEventDefinition>

export type FilterType = 'transaction' | 'block' | 'event'

export type Filter<
  TFilterType extends FilterType = 'event',
  TEventDefinition extends EventDefinition | undefined = undefined,
  TArgs extends EventFilterArgs<TEventDefinition> | undefined = undefined,
> = {
  id: Hex
  type: TFilterType
} & (TFilterType extends 'event'
  ? TEventDefinition extends EventDefinition
    ? TArgs extends EventFilterArgs<TEventDefinition>
      ? {
          args: TArgs
          event: TEventDefinition
        }
      : {
          args?: never
          event: TEventDefinition
        }
    : {
        args?: never
        event?: never
      }
  : {})
