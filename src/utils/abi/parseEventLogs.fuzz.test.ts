import type { AbiEvent } from 'abitype'
import fc from 'fast-check'
import { decodeEventLog, parseEventLogs, toEventSelector } from 'viem'
import { expect, test } from 'vitest'
import {
  abiCase,
  encodeLog,
  eventCase,
  expectedArgs,
  indexedCount,
  isHashed,
  toLog,
} from '~test/abi/eventLogs.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import type { Hex } from '../../types/misc.js'

const parameters = fuzzParameters(200)

/**
 * A model of `parseEventLogs` in strict mode, as its documentation states it.
 * A signature match wins. Otherwise anonymous events are only matched when
 * requested, and only when exactly one fits the topic count. The first
 * candidate that decodes is used.
 */
function parseModel(
  abi: readonly AbiEvent[],
  logs: readonly { data: Hex; topics: readonly Hex[] }[],
  eventName: readonly string[] | undefined,
) {
  return logs.flatMap((log) => {
    const bySelector = abi.filter(
      (event) =>
        !event.anonymous && log.topics[0] === toEventSelector(event as never),
    )
    const candidates = (() => {
      if (bySelector.length > 0) {
        if (!eventName) return bySelector
        return bySelector.filter((event) => eventName.includes(event.name))
      }
      const requested = (() => {
        if (eventName)
          return abi.filter(
            (event) => event.anonymous && eventName.includes(event.name),
          )
        if (abi.every((event) => event.anonymous)) return abi
        return []
      })()
      const fit = requested.filter(
        (event) => indexedCount(event) === log.topics.length,
      )
      if (fit.length === 1) return fit
      return []
    })()
    for (const event of candidates) {
      try {
        const decoded = decodeEventLog({
          abi: [event],
          data: log.data,
          topics: log.topics as [Hex, ...Hex[]],
        })
        return [[decoded.eventName, decoded.args]]
      } catch {}
    }
    return []
  })
}

test('matches the model for any ABI and logs', () => {
  fc.assert(
    fc.property(abiCase, (value) => {
      const parsed = parseEventLogs({
        abi: value.abi,
        logs: value.logs.map((log) => toLog(log)),
      })

      expect(parsed.map((x) => [x.eventName, x.args])).toEqual(
        parseModel(value.abi, value.logs, undefined),
      )
    }),
    parameters,
  )
})

test('matches the model for any eventName', () => {
  fc.assert(
    fc.property(
      abiCase,
      fc.subarray(['Transfer', 'Approval', 'Foo', 'Bar'], { minLength: 1 }),
      (value, eventName) => {
        const parsed = parseEventLogs({
          abi: value.abi,
          eventName,
          logs: value.logs.map((log) => toLog(log)),
        })

        expect(parsed.map((x) => [x.eventName, x.args])).toEqual(
          parseModel(value.abi, value.logs, eventName),
        )
      },
    ),
    parameters,
  )
})

test('decodes a log that a lone event emits', () => {
  fc.assert(
    fc.property(eventCase, (value) => {
      const log = encodeLog(value)

      const parsed = parseEventLogs({
        abi: [value.event],
        logs: [toLog(log)],
      })

      expect(parsed.map((x) => [x.eventName, x.args])).toEqual([
        [value.event.name, expectedArgs(value)],
      ])
    }),
    parameters,
  )
})

test('does not throw for any ABI and logs in non-strict mode', () => {
  fc.assert(
    fc.property(abiCase, (value) => {
      parseEventLogs({
        abi: value.abi,
        logs: value.logs.map((log) => toLog(log)),
        strict: false,
      })
    }),
    parameters,
  )
})

test('keeps a log when args hold its own indexed values', () => {
  fc.assert(
    fc.property(eventCase, (value) => {
      fc.pre(!value.event.anonymous)
      fc.pre(value.inputs.every((input) => input.name))
      const args = Object.fromEntries(
        value.inputs.flatMap((input, i) =>
          // Filters on hashed values compare the hash, so the plain value
          // types are enough here.
          input.indexed && !isHashed(input.kind)
            ? [[input.name, value.args[i]]]
            : [],
        ),
      )
      fc.pre(Object.keys(args).length > 0)
      const log = encodeLog(value)

      const parsed = parseEventLogs({
        abi: [value.event],
        args: args as never,
        logs: [toLog(log)],
      })

      expect(parsed).toHaveLength(1)
    }),
    parameters,
  )
})
