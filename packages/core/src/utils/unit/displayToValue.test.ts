import { expect, test } from 'vitest'

import { displayToValue } from './displayToValue'

test('converts number to unit of a given length', () => {
  expect(displayToValue('69', 1)).toMatchInlineSnapshot('690n')
  expect(displayToValue('13', 5)).toMatchInlineSnapshot('1300000n')
  expect(displayToValue('420', 10)).toMatchInlineSnapshot('4200000000000n')
  expect(displayToValue('20', 9)).toMatchInlineSnapshot('20000000000n')
  expect(displayToValue('40', 18)).toMatchInlineSnapshot(
    '40000000000000000000n',
  )
  expect(displayToValue('1.2345', 4)).toMatchInlineSnapshot('12345n')
  expect(displayToValue('1.2345000', 4)).toMatchInlineSnapshot('12345n')
  expect(displayToValue('6942069420.12345678912345', 18)).toMatchInlineSnapshot(
    '6942069420123456789123450000n',
  )
  expect(
    displayToValue('6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '694212312312306942012345444446789123450000000000000000000000000000000n',
  )
  expect(displayToValue('-69', 1)).toMatchInlineSnapshot('-690n')
  expect(displayToValue('-1.2345', 4)).toMatchInlineSnapshot('-12345n')
  expect(
    displayToValue('-6942069420.12345678912345', 18),
  ).toMatchInlineSnapshot('-6942069420123456789123450000n')
  expect(
    displayToValue('-6942123123123069420.1234544444678912345', 50),
  ).toMatchInlineSnapshot(
    '-694212312312306942012345444446789123450000000000000000000000000000000n',
  )
})

test('decimals === 0', () => {
  expect(
    displayToValue('69.2352112312312451512412341231', 0),
  ).toMatchInlineSnapshot('69n')
  expect(
    displayToValue('69.5952141234124125231523412312', 0),
  ).toMatchInlineSnapshot('70n')
})

test('decimals < fraction length', () => {
  expect(displayToValue('69.23521', 1)).toMatchInlineSnapshot('692n')
  expect(displayToValue('69.23521', 2)).toMatchInlineSnapshot('6924n')
  expect(displayToValue('69.23221', 2)).toMatchInlineSnapshot('6923n')
  expect(displayToValue('69.23261', 3)).toMatchInlineSnapshot('69233n')
  expect(displayToValue('69.23221', 3)).toMatchInlineSnapshot('69232n')
  expect(displayToValue('0.00000000059', 9)).toMatchInlineSnapshot('1n')
  expect(displayToValue('0.0000000003', 9)).toMatchInlineSnapshot('0n')
  expect(displayToValue('69.00000000000', 9)).toMatchInlineSnapshot(
    '69000000000n',
  )
  expect(displayToValue('69.00000000019', 9)).toMatchInlineSnapshot(
    '69000000000n',
  )
  expect(displayToValue('69.00000000059', 9)).toMatchInlineSnapshot(
    '69000000001n',
  )
  expect(displayToValue('69.59000000059', 9)).toMatchInlineSnapshot(
    '69590000001n',
  )
})
