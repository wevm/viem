import { expect, test } from 'vitest'

import { parseUnits } from './parseUnits.js'

test('converts number to unit of a given length', () => {
  expect(parseUnits('69', 1)).toMatchInlineSnapshot('690n')
  expect(parseUnits('13', 5)).toMatchInlineSnapshot('1300000n')
  expect(parseUnits('420', 10)).toMatchInlineSnapshot('4200000000000n')
  expect(parseUnits('20', 9)).toMatchInlineSnapshot('20000000000n')
  expect(parseUnits('40', 18)).toMatchInlineSnapshot('40000000000000000000n')
  expect(parseUnits('1.2345', 4)).toMatchInlineSnapshot('12345n')
  expect(parseUnits('1.2345000', 4)).toMatchInlineSnapshot('12345n')
  expect(parseUnits('6942069420.12345678912345', 18)).toMatchInlineSnapshot(
    '6942069420123456789123450000n',
  )
  expect(
    parseUnits('6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '694212312312306942012345444446789123450000000000000000000000000000000n',
  )
  expect(parseUnits('-69', 1)).toMatchInlineSnapshot('-690n')
  expect(parseUnits('-1.2345', 4)).toMatchInlineSnapshot('-12345n')
  expect(parseUnits('-6942069420.12345678912345', 18)).toMatchInlineSnapshot(
    '-6942069420123456789123450000n',
  )
  expect(
    parseUnits('-6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '-694212312312306942012345444446789123450000000000000000000000000000000n',
  )
})

test('decimals === 0', () => {
  expect(
    parseUnits('69.2352112312312451512412341231', 0),
  ).toMatchInlineSnapshot('69n')
  expect(
    parseUnits('69.5952141234124125231523412312', 0),
  ).toMatchInlineSnapshot('70n')
})

test('decimals < fraction length', () => {
  expect(parseUnits('69.23521', 1)).toMatchInlineSnapshot('692n')
  expect(parseUnits('69.23521', 2)).toMatchInlineSnapshot('6924n')
  expect(parseUnits('69.23221', 2)).toMatchInlineSnapshot('6923n')
  expect(parseUnits('69.23261', 3)).toMatchInlineSnapshot('69233n')
  expect(parseUnits('69.23221', 3)).toMatchInlineSnapshot('69232n')
  expect(parseUnits('0.00000000059', 9)).toMatchInlineSnapshot('1n')
  expect(parseUnits('0.0000000003', 9)).toMatchInlineSnapshot('0n')
  expect(parseUnits('69.00000000000', 9)).toMatchInlineSnapshot('69000000000n')
  expect(parseUnits('69.00000000019', 9)).toMatchInlineSnapshot('69000000000n')
  expect(parseUnits('69.00000000059', 9)).toMatchInlineSnapshot('69000000001n')
  expect(parseUnits('69.59000000059', 9)).toMatchInlineSnapshot('69590000001n')
})
