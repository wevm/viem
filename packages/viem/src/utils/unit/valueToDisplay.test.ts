import { expect, test } from 'vitest'

import { valueToDisplay } from './valueToDisplay'

test('converts value to number', () => {
  expect(valueToDisplay(69n, 0)).toMatchInlineSnapshot('"69"')
  expect(valueToDisplay(69n, 5)).toMatchInlineSnapshot('"0.00069"')
  expect(valueToDisplay(690n, 1)).toMatchInlineSnapshot('"69"')
  expect(valueToDisplay(1300000n, 5)).toMatchInlineSnapshot('"13"')
  expect(valueToDisplay(4200000000000n, 10)).toMatchInlineSnapshot('"420"')
  expect(valueToDisplay(20000000000n, 9)).toMatchInlineSnapshot('"20"')
  expect(valueToDisplay(40000000000000000000n, 18)).toMatchInlineSnapshot(
    '"40"',
  )
  expect(valueToDisplay(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(valueToDisplay(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
  expect(
    valueToDisplay(6942069420123456789123450000n, 18),
  ).toMatchInlineSnapshot('"6942069420.12345678912345"')
  expect(
    valueToDisplay(
      694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"6942123123123069420.1234544444678912345"')
  expect(valueToDisplay(-690n, 1)).toMatchInlineSnapshot('"-69"')
  expect(valueToDisplay(-1300000n, 5)).toMatchInlineSnapshot('"-13"')
  expect(valueToDisplay(-4200000000000n, 10)).toMatchInlineSnapshot('"-420"')
  expect(valueToDisplay(-20000000000n, 9)).toMatchInlineSnapshot('"-20"')
  expect(valueToDisplay(-40000000000000000000n, 18)).toMatchInlineSnapshot(
    '"-40"',
  )
  expect(valueToDisplay(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(valueToDisplay(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
  expect(
    valueToDisplay(-6942069420123456789123450000n, 18),
  ).toMatchInlineSnapshot('"-6942069420.12345678912345"')
  expect(
    valueToDisplay(
      -694212312312306942012345444446789123450000000000000000000000000000000n,
      50,
    ),
  ).toMatchInlineSnapshot('"-6942123123123069420.1234544444678912345"')
})
