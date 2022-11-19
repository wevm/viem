import { expect, test } from 'vitest'

import { valueAsEther } from './valueAsEther'

test('converts wei to ether', () => {
  expect(valueAsEther(6942069420123456789123450000n)).toMatchInlineSnapshot(
    '"6942069420.12345678912345"',
  )
  expect(valueAsEther(6942069420000000000000000000n)).toMatchInlineSnapshot(
    '"6942069420"',
  )
  expect(valueAsEther(1000000000000000000n)).toMatchInlineSnapshot('"1"')
  expect(valueAsEther(500000000000000000n)).toMatchInlineSnapshot('"0.5"')
  expect(valueAsEther(100000000000000000n)).toMatchInlineSnapshot('"0.1"')
  expect(valueAsEther(10000000n)).toMatchInlineSnapshot('"0.00000000001"')
  expect(valueAsEther(1000000n)).toMatchInlineSnapshot('"0.000000000001"')
  expect(valueAsEther(100000n)).toMatchInlineSnapshot('"0.0000000000001"')
  expect(valueAsEther(10000n)).toMatchInlineSnapshot('"0.00000000000001"')
  expect(valueAsEther(1000n)).toMatchInlineSnapshot('"0.000000000000001"')
  expect(valueAsEther(100n)).toMatchInlineSnapshot('"0.0000000000000001"')
  expect(valueAsEther(10n)).toMatchInlineSnapshot('"0.00000000000000001"')
  expect(valueAsEther(1n)).toMatchInlineSnapshot('"0.000000000000000001"')
  expect(valueAsEther(-6942069420123456789123450000n)).toMatchInlineSnapshot(
    '"-6942069420.12345678912345"',
  )
  expect(valueAsEther(-6942069420000000000000000000n)).toMatchInlineSnapshot(
    '"-6942069420"',
  )
  expect(valueAsEther(-1000000000000000000n)).toMatchInlineSnapshot('"-1"')
  expect(valueAsEther(-500000000000000000n)).toMatchInlineSnapshot('"-0.5"')
  expect(valueAsEther(-100000000000000000n)).toMatchInlineSnapshot('"-0.1"')
  expect(valueAsEther(-10000000n)).toMatchInlineSnapshot('"-0.00000000001"')
  expect(valueAsEther(-1000000n)).toMatchInlineSnapshot('"-0.000000000001"')
  expect(valueAsEther(-100000n)).toMatchInlineSnapshot('"-0.0000000000001"')
  expect(valueAsEther(-10000n)).toMatchInlineSnapshot('"-0.00000000000001"')
  expect(valueAsEther(-1000n)).toMatchInlineSnapshot('"-0.000000000000001"')
  expect(valueAsEther(-100n)).toMatchInlineSnapshot('"-0.0000000000000001"')
  expect(valueAsEther(-10n)).toMatchInlineSnapshot('"-0.00000000000000001"')
  expect(valueAsEther(-1n)).toMatchInlineSnapshot('"-0.000000000000000001"')
})

test('converts gwei to ether', () => {
  expect(valueAsEther(69420123456700n, 'gwei')).toMatchInlineSnapshot(
    '"69420.1234567"',
  )
  expect(valueAsEther(69420000000000n, 'gwei')).toMatchInlineSnapshot('"69420"')
  expect(valueAsEther(1000000000n, 'gwei')).toMatchInlineSnapshot('"1"')
  expect(valueAsEther(500000000n, 'gwei')).toMatchInlineSnapshot('"0.5"')
  expect(valueAsEther(100000000n, 'gwei')).toMatchInlineSnapshot('"0.1"')
  expect(valueAsEther(10000000n, 'gwei')).toMatchInlineSnapshot('"1000000"')
  expect(valueAsEther(1000000n, 'gwei')).toMatchInlineSnapshot('"10000"')
  expect(valueAsEther(100000n, 'gwei')).toMatchInlineSnapshot('"100"')
  expect(valueAsEther(10000n, 'gwei')).toMatchInlineSnapshot('"1"')
  expect(valueAsEther(1000n, 'gwei')).toMatchInlineSnapshot('"0.000001"')
  expect(valueAsEther(100n, 'gwei')).toMatchInlineSnapshot('"0.0000001"')
  expect(valueAsEther(10n, 'gwei')).toMatchInlineSnapshot('"0.00000001"')
  expect(valueAsEther(1n, 'gwei')).toMatchInlineSnapshot('"0.000000001"')
  expect(valueAsEther(-69420123456700n, 'gwei')).toMatchInlineSnapshot(
    '"-69420.1234567"',
  )
  expect(valueAsEther(-69420000000000n, 'gwei')).toMatchInlineSnapshot(
    '"-69420"',
  )
  expect(valueAsEther(-1000000000n, 'gwei')).toMatchInlineSnapshot('"-1"')
  expect(valueAsEther(-500000000n, 'gwei')).toMatchInlineSnapshot('"-0.5"')
  expect(valueAsEther(-100000000n, 'gwei')).toMatchInlineSnapshot('"-0.1"')
  expect(valueAsEther(-10000000n, 'gwei')).toMatchInlineSnapshot('"-1000000"')
  expect(valueAsEther(-1000000n, 'gwei')).toMatchInlineSnapshot('"-10000"')
  expect(valueAsEther(-100000n, 'gwei')).toMatchInlineSnapshot('"-100"')
  expect(valueAsEther(-10000n, 'gwei')).toMatchInlineSnapshot('"-1"')
  expect(valueAsEther(-1000n, 'gwei')).toMatchInlineSnapshot('"-0.000001"')
  expect(valueAsEther(-100n, 'gwei')).toMatchInlineSnapshot('"-0.0000001"')
  expect(valueAsEther(-10n, 'gwei')).toMatchInlineSnapshot('"-0.00000001"')
  expect(valueAsEther(-1n, 'gwei')).toMatchInlineSnapshot('"-0.000000001"')
})
