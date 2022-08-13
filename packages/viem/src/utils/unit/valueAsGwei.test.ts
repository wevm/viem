import { expect, test } from 'vitest'

import { valueAsGwei } from './valueAsGwei'

test('converts wei to gwei', () => {
  expect(valueAsGwei(69420123456700n)).toMatchInlineSnapshot('"69420.1234567"')
  expect(valueAsGwei(69420000000000n)).toMatchInlineSnapshot('"69420"')
  expect(valueAsGwei(1000000000n)).toMatchInlineSnapshot('"1"')
  expect(valueAsGwei(500000000n)).toMatchInlineSnapshot('"0.5"')
  expect(valueAsGwei(100000000n)).toMatchInlineSnapshot('"0.1"')
  expect(valueAsGwei(10000000n)).toMatchInlineSnapshot('"1000000"')
  expect(valueAsGwei(1000000n)).toMatchInlineSnapshot('"10000"')
  expect(valueAsGwei(100000n)).toMatchInlineSnapshot('"100"')
  expect(valueAsGwei(10000n)).toMatchInlineSnapshot('"1"')
  expect(valueAsGwei(1000n)).toMatchInlineSnapshot('"0.000001"')
  expect(valueAsGwei(100n)).toMatchInlineSnapshot('"0.0000001"')
  expect(valueAsGwei(10n)).toMatchInlineSnapshot('"0.00000001"')
  expect(valueAsGwei(1n)).toMatchInlineSnapshot('"0.000000001"')
  expect(valueAsGwei(-69420123456700n)).toMatchInlineSnapshot(
    '"-69420.1234567"',
  )
  expect(valueAsGwei(-69420000000000n)).toMatchInlineSnapshot('"-69420"')
  expect(valueAsGwei(-1000000000n)).toMatchInlineSnapshot('"-1"')
  expect(valueAsGwei(-500000000n)).toMatchInlineSnapshot('"-0.5"')
  expect(valueAsGwei(-100000000n)).toMatchInlineSnapshot('"-0.1"')
  expect(valueAsGwei(-10000000n)).toMatchInlineSnapshot('"-1000000"')
  expect(valueAsGwei(-1000000n)).toMatchInlineSnapshot('"-10000"')
  expect(valueAsGwei(-100000n)).toMatchInlineSnapshot('"-100"')
  expect(valueAsGwei(-10000n)).toMatchInlineSnapshot('"-1"')
  expect(valueAsGwei(-1000n)).toMatchInlineSnapshot('"-0.000001"')
  expect(valueAsGwei(-100n)).toMatchInlineSnapshot('"-0.0000001"')
  expect(valueAsGwei(-10n)).toMatchInlineSnapshot('"-0.00000001"')
  expect(valueAsGwei(-1n)).toMatchInlineSnapshot('"-0.000000001"')
})
