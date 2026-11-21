import fc from 'fast-check'
import { AbiEvent as OxAbiEvent } from 'ox'
import { BaseError, decodeEventLog, toEventSelector } from 'viem'
import { expect, test } from 'vitest'
import {
  abiCase,
  encodeLog,
  eventCase,
  expectedArgs,
  lowercase,
  noiseLog,
} from '~test/abi/eventLogs.js'
import { fuzzParameters } from '~test/tempo/fuzz.js'
import type { Hex } from '../../types/misc.js'

const parameters = fuzzParameters(200)

test('decodes the arguments a log was encoded from', () => {
  fc.assert(
    fc.property(eventCase, (value) => {
      const log = encodeLog(value)

      const decoded = decodeEventLog({
        abi: [value.event],
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      })

      expect(decoded).toEqual({
        args: expectedArgs(value),
        eventName: value.event.name,
      })
    }),
    parameters,
  )
})

test('matches ox for named non-anonymous events', () => {
  fc.assert(
    fc.property(eventCase, (value) => {
      // ox reads unnamed inputs in a different order, and has no anonymous
      // events.
      fc.pre(!value.event.anonymous)
      fc.pre(value.inputs.every((input) => input.name))
      const log = encodeLog(value)

      const decoded = decodeEventLog({
        abi: [value.event],
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      })

      // ox returns lowercase addresses, and Viem returns checksummed ones.
      expect(lowercase(decoded.args)).toEqual(
        lowercase(OxAbiEvent.decode(value.event, log)),
      )
    }),
    parameters,
  )
})

test('decodes a signature match the same way in any ABI', () => {
  fc.assert(
    fc.property(eventCase, abiCase, (value, other) => {
      fc.pre(!value.event.anonymous)
      const selector = toEventSelector(value.event as never)
      // An event with the same signature in the other ABI wins if it comes
      // first, since overloads that share a signature are decoded in order.
      fc.pre(
        other.abi.every(
          (event) =>
            event.anonymous || toEventSelector(event as never) !== selector,
        ),
      )
      const log = encodeLog(value)

      const decoded = decodeEventLog({
        abi: [...other.abi, value.event],
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      })

      expect(decoded).toEqual({
        args: expectedArgs(value),
        eventName: value.event.name,
      })
    }),
    parameters,
  )
})

test('returns or throws a Viem error for any log', () => {
  fc.assert(
    fc.property(
      fc.array(eventCase, { maxLength: 4 }),
      noiseLog,
      fc.boolean(),
      (cases, log, strict) => {
        try {
          decodeEventLog({
            abi: cases.map((x) => x.event),
            data: log.data,
            strict,
            topics: log.topics as [Hex, ...Hex[]],
          })
        } catch (error) {
          expect(error).toBeInstanceOf(BaseError)
        }
      },
    ),
    parameters,
  )
})
