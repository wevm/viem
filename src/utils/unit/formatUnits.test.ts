import { expect, test } from 'vitest'

import { formatUnits } from './formatUnits.js'

test('converts value to number', () => {
  expect(formatUnits(69n, 0)).toMatchInlineSnapshot('"69"')
  expect(formatUnits(69n, 5)).toMatchInlineSnapshot('"0.00069"')
  expect(formatUnits(690n, 1)).toMatchInlineSnapshot('"69"')
  expect(formatUnits(1300000n, 5)).toMatchInlineSnapshot('"13"')
  expect(formatUnits(4200000000000n, 10)).toMatchInlineSnapshot('"420"')
  expect(formatUnits(20000000000n, 9)).toMatchInlineSnapshot('"20"')
  expect(formatUnits(40000000000000000000n, 18)).toMatchInlineSnapshot('"40"')
  expect(formatUnits(10000000000000n, 18)).toMatchInlineSnapshot('"0.00001"')
  expect(formatUnits(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(formatUnits(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(formatUnits(6942069420123456789123450000n, 18)).toMatchInlineSnapshot(
    '"6942069420.12345678912345"',
  )
  expect(
    formatUnits(
      694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"6942123123123069420.1234544444678912345"')
  expect(formatUnits(-690n, 1)).toMatchInlineSnapshot('"-69"')
  expect(formatUnits(-1300000n, 5)).toMatchInlineSnapshot('"-13"')
  expect(formatUnits(-4200000000000n, 10)).toMatchInlineSnapshot('"-420"')
  expect(formatUnits(-20000000000n, 9)).toMatchInlineSnapshot('"-20"')
  expect(formatUnits(-40000000000000000000n, 18)).toMatchInlineSnapshot('"-40"')
  expect(formatUnits(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(formatUnits(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(formatUnits(-6942069420123456789123450000n, 18)).toMatchInlineSnapshot(
    '"-6942069420.12345678912345"',
  )
  expect(
    formatUnits(
      -694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"-6942123123123069420.1234544444678912345"')
})
