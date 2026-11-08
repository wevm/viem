import { AbiEvent } from 'ox'
import type { Hex, Log } from 'ox'

/**
 * Returns the topics for an `event` (with indexed `args`) or a list of
 * `events`. Anonymous events have no signature topic to filter by.
 */
export function getTopics(options: {
  args?: unknown
  event?: AbiEvent.AbiEvent | undefined
  events?: readonly AbiEvent.AbiEvent[] | undefined
}): readonly (Hex.Hex | readonly Hex.Hex[] | null)[] | undefined {
  const { args, event, events } = options
  if (event)
    return AbiEvent.encode(event, ...((args !== undefined ? [args] : []) as []))
      .topics
  if (!events) return undefined
  const selectors = events
    .filter((event) => !event.anonymous)
    .map((event) => AbiEvent.getSelector(event))
  if (selectors.length === 0) return undefined
  return [selectors]
}

/**
 * Extracts and decodes the logs that match the requested `events`.
 *
 * Nothing in a log identifies an anonymous event, so anonymous events are only
 * decoded when every requested event is anonymous (such as a single anonymous
 * `event`). A log is then decoded as the one anonymous event with as many
 * indexed inputs as the log has topics, and skipped when it fails to decode.
 */
export function extractLogs(
  events: readonly AbiEvent.AbiEvent[],
  logs: readonly Log.Log[],
  options: { args?: unknown; strict: boolean },
): readonly Log.Log[] {
  const { args, strict } = options
  if (events.length === 0 || events.some((event) => !event.anonymous))
    return AbiEvent.extractLogs(events, logs, { args, strict })

  return logs.flatMap((log) => {
    // Several anonymous events of the same arity are not guessed: dynamic
    // values can decode as static types without throwing.
    const candidates = events.filter(
      (event) =>
        event.inputs.filter((input) => input.indexed).length ===
        log.topics.length,
    )
    const [event] = candidates
    if (!event || candidates.length > 1) return []
    try {
      const decoded = AbiEvent.decode(event, log)
      if (args) AbiEvent.assertArgs(event, decoded, args)
      return [{ ...log, args: decoded, eventName: event.name }]
    } catch {
      return []
    }
  })
}
