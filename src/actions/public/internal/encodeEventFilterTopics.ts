import type { AbiEvent } from 'abitype'

import type { LogTopic } from '../../../types/misc.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../../utils/abi/encodeEventTopics.js'

/**
 * Encodes the `topics` of a log filter from an `event` or `events` option.
 *
 * A single `event` encodes to its topic list. Otherwise, the topics of every
 * event in `events` are flattened into the first topic position.
 */
export function encodeEventFilterTopics(parameters: {
  args?: unknown | undefined
  event?: AbiEvent | undefined
  events?: readonly unknown[] | undefined
}): LogTopic[] {
  const { args, event } = parameters
  const events = parameters.events ?? (event ? [event] : undefined)
  if (!events) return []
  const encoded = (events as AbiEvent[]).flatMap((event) =>
    encodeEventTopics({
      abi: [event],
      eventName: event.name,
      args,
    } as EncodeEventTopicsParameters),
  )
  if (event) return encoded as LogTopic[]
  return [encoded as LogTopic]
}
