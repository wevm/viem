import { expect, test } from 'vitest'

import { formatUnit } from './formatUnit'

test('converts value to number', () => {
  expect(formatUnit(69n, 0)).toMatchInlineSnapshot('"69"')
  expect(formatUnit(69n, 5)).toMatchInlineSnapshot('"0.00069"')
  expect(formatUnit(690n, 1)).toMatchInlineSnapshot('"69"')
  expect(formatUnit(1300000n, 5)).toMatchInlineSnapshot('"13"')
  expect(formatUnit(4200000000000n, 10)).toMatchInlineSnapshot('"420"')
  expect(formatUnit(20000000000n, 9)).toMatchInlineSnapshot('"20"')
  expect(formatUnit(40000000000000000000n, 18)).toMatchInlineSnapshot('"40"')
  expect(formatUnit(10000000000000n, 18)).toMatchInlineSnapshot('"0.00001"')
  expect(formatUnit(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(formatUnit(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(formatUnit(6942069420123456789123450000n, 18)).toMatchInlineSnapshot(
    '"6942069420.12345678912345"',
  )
  expect(
    formatUnit(
      694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"6942123123123069420.1234544444678912345"')
  expect(formatUnit(-690n, 1)).toMatchInlineSnapshot('"-69"')
  expect(formatUnit(-1300000n, 5)).toMatchInlineSnapshot('"-13"')
  expect(formatUnit(-4200000000000n, 10)).toMatchInlineSnapshot('"-420"')
  expect(formatUnit(-20000000000n, 9)).toMatchInlineSnapshot('"-20"')
  expect(formatUnit(-40000000000000000000n, 18)).toMatchInlineSnapshot('"-40"')
  expect(formatUnit(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(formatUnit(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(formatUnit(-6942069420123456789123450000n, 18)).toMatchInlineSnapshot(
    '"-6942069420.12345678912345"',
  )
  expect(
    formatUnit(
      -694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"-6942123123123069420.1234544444678912345"')
})
