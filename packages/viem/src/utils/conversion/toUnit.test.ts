import { expect, test } from 'vitest'

import { toUnit } from './toUnit'

test('converts number to unit of a given length', () => {
  expect(toUnit('69', 1)).toMatchInlineSnapshot('690n')
  expect(toUnit('13', 5)).toMatchInlineSnapshot('1300000n')
  expect(toUnit('420', 10)).toMatchInlineSnapshot('4200000000000n')
  expect(toUnit('20', 9)).toMatchInlineSnapshot('20000000000n')
  expect(toUnit('40', 18)).toMatchInlineSnapshot('40000000000000000000n')
  expect(toUnit('1.2345', 4)).toMatchInlineSnapshot('12345n')
  expect(toUnit('1.2345000', 4)).toMatchInlineSnapshot('12345n')
  expect(toUnit('6942069420.12345678912345', 18)).toMatchInlineSnapshot(
    '6942069420123456789123450000n',
  )
  expect(
    toUnit('6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '694212312312306942012345444446789123450000000000000000000000000000000n',
  )
  expect(toUnit('-69', 1)).toMatchInlineSnapshot('-690n')
  expect(toUnit('-1.2345', 4)).toMatchInlineSnapshot('-12345n')
  expect(toUnit('-6942069420.12345678912345', 18)).toMatchInlineSnapshot(
    '-6942069420123456789123450000n',
  )
  expect(
    toUnit('-6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '-694212312312306942012345444446789123450000000000000000000000000000000n',
  )
})

test('error: throws if whole number cannot be created from shifting decimal', () => {
  expect(() => toUnit('1.123', 2)).toThrowError(
    'cannot create a whole number from 1.123 by shifting 2 decimals',
  )
  expect(() => toUnit('1.69420', 2)).toThrowError(
    'cannot create a whole number from 1.69420 by shifting 2 decimals',
  )
  expect(() => toUnit('69420', -1)).toThrowError(
    'cannot create a whole number from 69420 by shifting -1 decimals',
  )
  expect(() => toUnit('69.420', -2)).toThrowError(
    'cannot create a whole number from 69.420 by shifting -2 decimals',
  )
})
